"use strict";

class Deck extends HTMLElement {
  PATH_HEIGHT = 250;
  BENDYNESS = 5;
  // Lowers the path by this many px
  HEIGHT_OFFSET = 70;
  svg;
  path;
  cards = [];
  shadowRoot;
  slot;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = `
      <link rel="stylesheet" href="components/as-deck.css">
      <svg>
        <path d="" stroke="black" fill="transparent" />
      </svg>
      <slot></slot>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.slot = this.shadowRoot.lastElementChild;
    this.slot.addEventListener("slotchange", (e) => {
      // this.updatePath();
    });
    document.addEventListener("readystatechange", this.onLoad.bind(this));
    this.addEventListener("cardstatechange", this.cardStateChange);
  }

  // Runs every time the element is added to the document
  connectedCallback() {
    this.svg = this.shadowRoot.querySelector("svg");
    this.path = this.svg.firstElementChild;
    window.addEventListener("resize", this.updatePath.bind(this));
  }

  // Event listener that fires when finished loading
  async onLoad() {
    // Only fire when styles are loaded
    if (document.readyState !== "complete") return;
    // Get child cards
    this.cards = this.slot
      .assignedElements()
      .filter((elem) => elem.tagName === "AS-CARD");
    // If there are no cards, warn
    if (this.cards.length === 0) {
      console.warn("No cards detected within <as-deck>, intended?");
      return;
    }
    // Request card width
    let cardWidth = null;
    await new Promise((resolve, reject) => {
      this.addEventListener("send-width", (event) => {
        cardWidth = event.detail.width;
        event.stopPropagation();
        resolve();
      });

      this.cards[0].dispatchEvent(new Event("get-width", { composed: true }));
      setTimeout(() => { reject("Child card failed to answer"); }, 3000);
    });
    if (cardWidth === null) return;
    this.updatePath();
  }

  // Recreates and then sets the SVG path
  updatePath() {
    const card = this.slot
      .assignedElements()[0]
      .shadowRoot.querySelector(".card");
    const cardWidth = card.offsetWidth;
    const startX =
      this.svg.clientWidth / 2 - (cardWidth * this.cards.length) / 2;
    const endX = this.svg.clientWidth / 2 + (cardWidth * this.cards.length) / 2;
    this.path.setAttribute(
      "d",
      `M ${startX} ${this.svg.clientHeight + this.HEIGHT_OFFSET} C ` +
        `${startX - cardWidth * this.BENDYNESS} ${
          this.svg.clientHeight - this.PATH_HEIGHT + this.HEIGHT_OFFSET
        }, ` +
        `${endX + cardWidth * this.BENDYNESS} ${
          this.svg.clientHeight - this.PATH_HEIGHT + this.HEIGHT_OFFSET
        }, ` +
        `${endX} ${this.svg.clientHeight + this.HEIGHT_OFFSET}`,
    );
    this.updateAllCards();
  }

  updateAllCards() {
    for (const card of this.cards) this.updateCard(card);
  }

  SPACING_MULT = 1.3;
  updateCard(card) {
    let top, left, rotate;
    const arcLength = card.offsetWidth * this.SPACING_MULT;
    const cardIndex = Object.keys(this.cards).find(
      (key) => this.cards[key] === card,
    );
    const startLength =
      this.path.getTotalLength() / 2 -
      (arcLength * (this.cards.length - 1)) / 2;
    const targetLength = startLength + arcLength * cardIndex;
    const targetPoint = this.path.getPointAtLength(targetLength);
    const deckRect = this.svg.getBoundingClientRect();
    top = `${deckRect.top + targetPoint.y - card.offsetHeight / 2}px`;
    left = `${deckRect.left + targetPoint.x - card.offsetWidth / 2}px`;
    // translation code
    const p1 = this.path.getPointAtLength(targetLength - card.offsetWidth / 2);
    const p2 = this.path.getPointAtLength(targetLength + card.offsetWidth / 2);
    const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    rotate = `${radians * (180 / Math.PI)}deg`;
    this.cards[cardIndex].dispatchEvent(
      new CustomEvent("set-pos", {
        detail: { left, top, rotate },
        composed: true,
      }),
    );
  }

  cardStateChange(event) {
    event.detail.cardState;
  }
}

customElements.define("as-deck", Deck);
