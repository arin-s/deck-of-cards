"use strict";

import css from "./as-deck.css?url";

class Deck extends HTMLElement {
  PATH_HEIGHT = 250;
  BENDYNESS = 5;
  // Lowers the path by this many px
  HEIGHT_OFFSET = 70;
  svg!: SVGSVGElement;
  path!: SVGPathElement;
  slotElem!: HTMLSlotElement;
  cards: HTMLElement[] = [];
  shadowRoot;
  cardWidth: number = Number.NaN;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    console.log(css);
    template.innerHTML = `
      <link rel="stylesheet" href="${css}">
      <svg>
        <path d="" stroke="black" fill="transparent" />
      </svg>
      <slot></slot>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.slotElem = this.shadowRoot.lastElementChild as HTMLSlotElement;
    /*
    this.slotElem.addEventListener("slotchange", (e: Event) => {
      this.updatePath();
    });
    */
    document.addEventListener("readystatechange", () => {
      void this.onLoad.bind(this)();
    });
    this.addEventListener(
      "cardstatechange",
      this.cardStateChange.bind(this) as EventListener,
    );
  }

  // Runs every time the element is added to the document
  connectedCallback() {
    this.svg = this.shadowRoot.querySelector("svg") as SVGSVGElement;
    this.path = this.svg.querySelector("path") as SVGPathElement;
    window.addEventListener("resize", this.updatePath.bind(this));
  }

  // Event listener that fires when finished loading
  async onLoad() {
    // Only fire when styles are loaded
    if (document.readyState !== "complete") return;
    // Get child cards
    this.cards = this.slotElem
      .assignedElements()
      .filter((elem) => elem.tagName === "AS-CARD") as HTMLElement[];
    // If there are no cards, warn
    if (this.cards.length === 0) {
      console.warn("No cards detected within <as-deck>, intended?");
      return;
    }
    // Request card width
    let cardWidth = Number.NaN;
    await new Promise((resolve, reject) => {
      this.addEventListener("send-width", ((
        event: CustomEvent<{ width: number }>,
      ) => {
        cardWidth = event.detail.width;
        event.stopPropagation();
        resolve("");
      }) as EventListener);
      this.cards[0].dispatchEvent(new Event("get-width", { composed: true }));
      setTimeout(() => {
        reject(new Error("Child card failed to answer"));
      }, 3000);
    });
    this.cardWidth = cardWidth;
    this.updatePath();
  }

  // Recreates and then sets the SVG path
  updatePath() {
    /*
    const elems = this.slotElem.assignedElements()[0];
    const shadowRoot = elems.shadowRoot;
    if(shadowRoot === null)
       throw new Error("Could not access shadow root!")
    shadowRoot.querySelector(".card");
    */
    const startX =
      this.svg.clientWidth / 2 - (this.cardWidth * this.cards.length) / 2;
    const endX =
      this.svg.clientWidth / 2 + (this.cardWidth * this.cards.length) / 2;

    this.path.setAttribute(
      "d",
      `M ${startX.toString()} ${(this.svg.clientHeight + this.HEIGHT_OFFSET).toString()} C ` +
        `${(startX - this.cardWidth * this.BENDYNESS).toString()} ${(
          this.svg.clientHeight -
          this.PATH_HEIGHT +
          this.HEIGHT_OFFSET
        ).toString()}, ` +
        `${(endX + this.cardWidth * this.BENDYNESS).toString()} ${(
          this.svg.clientHeight -
          this.PATH_HEIGHT +
          this.HEIGHT_OFFSET
        ).toString()}, ` +
        `${endX.toString()} ${(this.svg.clientHeight + this.HEIGHT_OFFSET).toString()}`,
    );
    for (const [index, card] of this.cards.entries())
      this.updateCard(index, card);
  }

  SPACING_MULT = 1.3;
  updateCard(index: number, card: HTMLElement) {
    const arcLength = card.offsetWidth * this.SPACING_MULT;
    const startLength =
      this.path.getTotalLength() / 2 -
      (arcLength * (this.cards.length - 1)) / 2;
    const targetLength = startLength + arcLength * index;
    const targetPoint = this.path.getPointAtLength(targetLength);
    const deckRect = this.svg.getBoundingClientRect();
    const top = deckRect.top + targetPoint.y - card.offsetHeight / 2;
    const left = deckRect.left + targetPoint.x - card.offsetWidth / 2;
    // translation code
    const p1 = this.path.getPointAtLength(targetLength - card.offsetWidth / 2);
    const p2 = this.path.getPointAtLength(targetLength + card.offsetWidth / 2);
    const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const rotate = `${(radians * (180 / Math.PI)).toString()}deg`;
    this.cards[index].dispatchEvent(
      new CustomEvent("set-pos", {
        detail: { top, left, rotate },
        composed: true,
      }),
    );
  }

  cardStateChange(event: CustomEvent<{ cardState: number }>) {
    console.log(event.detail.cardState);
  }
}
/*
declare global {
  interface GlobalEventHandlersEventMap {
    cardStateChange: CustomEvent<{cardState: number}>;
    setPos: CustomEvent<{left: string, top: string, rotate: string}>;
  }
}
*/
customElements.define("as-deck", Deck);
