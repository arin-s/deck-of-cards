"use strict"

class Deck extends HTMLElement {
  PATH_HEIGHT = 250;
  BENDYNESS = 5;
  //Lowers the path by this many px
  HEIGHT_OFFSET = 70;
  svg;
  path;
  cards = [];

  constructor() {
    super();

  }

  //Runs every time the element is added to the document
  connectedCallback() {
    this.cards = [...this.children];
    this.insertAdjacentHTML("afterbegin",
      `<svg id="svg">
        <path id="path" d="" stroke="black" fill="transparent"/>
      </svg>`);
    this.svg = this.firstElementChild;
    this.path = this.svg.firstElementChild;
    this.fixPath();
    window.addEventListener("resize", this.fixPath);
  }

  //Recreates and then sets the SVG path 
  fixPath() {
    //If there are no cards, do nothing
    if(this.children.length === 0)
      return;
    let cardWidth = this.cards[0].offsetWidth;
    let startX = this.svg.clientWidth / 2 - cardWidth * this.cards.length / 2;
    let endX = this.svg.clientWidth / 2 + cardWidth * this.cards.length / 2;
    this.path.setAttribute("d", `M ${startX} ${this.svg.clientHeight + this.HEIGHT_OFFSET} C ${startX - cardWidth * this.BENDYNESS} ${this.svg.clientHeight - this.PATH_HEIGHT + this.HEIGHT_OFFSET},
    ${endX + cardWidth * this.BENDYNESS} ${this.svg.clientHeight - this.PATH_HEIGHT + this.HEIGHT_OFFSET}, ${endX} ${this.svg.clientHeight + this.HEIGHT_OFFSET}`);
    //fixAllPos();
  }
}

customElements.define("as-deck", Deck);


/*
//Declarations
let this.svg = document.getElementById("this.svg");
let path = document.getElementById("path");


//Cards
function cardManagerFactory() {
  let cards = [];


  function addCard(title, img, link) {
    let card = document.createElement("div");
    document.getElementsByTagName("body")[0].appendChild(card);
    card.classList.add("card");
    card.innerText = title;
    cards.push(card);
    fixPath();
  }

  function fixAllPos() {
    for (let card of cards)
      fixPos(card);
  }


  const SPACING_MULT = 1.3;
  function fixPos(card) {
    let arcLength = card.offsetWidth * SPACING_MULT;
    let cardIndex = Object.keys(cards).find(key => cards[key] === card);
    let startLength = path.getTotalLength() / 2 - arcLength * (cards.length - 1) / 2;
    let targetLength = startLength + arcLength * cardIndex;
    let targetPoint = path.getPointAtLength(targetLength);
    let deckRect = this.svg.getBoundingClientRect();
    card.style.top = `${deckRect.top + targetPoint.y - card.offsetHeight / 2}px`;
    card.style.left = `${deckRect.left + targetPoint.x - card.offsetWidth / 2}px`;
    //translation code
    let p1 = path.getPointAtLength(targetLength - card.offsetWidth / 2);
    let p2 = path.getPointAtLength(targetLength + card.offsetWidth / 2);
    let radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    card.style.rotate = `${radians * (180 / Math.PI)}deg`;
  }


  return { addCard, fixPath, cards };
}
*/