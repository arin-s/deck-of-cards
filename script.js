"use strict"

//Declarations
let deck = document.getElementById("deck");
let path = document.getElementById("path");


//Cards
function cardManagerFactory() {
  let cards = [];
  window.addEventListener("resize", fixPath);

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
    let deckRect = deck.getBoundingClientRect();
    card.style.top = `${deckRect.top + targetPoint.y - card.offsetHeight / 2}px`;
    card.style.left = `${deckRect.left + targetPoint.x - card.offsetWidth / 2}px`;
    //translation code
    let p1 = path.getPointAtLength(targetLength - card.offsetWidth / 2);
    let p2 = path.getPointAtLength(targetLength + card.offsetWidth / 2);
    let radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    card.style.rotate = `${radians * (180 / Math.PI)}deg`;
  }

  const pathHeight = 250;
  const BENDYNESS = 5;
  const HEIGHT_OFFSET = 70;
  function fixPath() {
    let cardWidth = cards[0].offsetWidth;
    let startX = deck.clientWidth / 2 - cardWidth * cards.length / 2;
    let endX = deck.clientWidth / 2 + cardWidth * cards.length / 2;
    path.setAttribute("d", `M ${startX} ${deck.clientHeight + HEIGHT_OFFSET} C ${startX - cardWidth * BENDYNESS} ${deck.clientHeight - pathHeight + HEIGHT_OFFSET},
      ${endX + cardWidth * BENDYNESS} ${deck.clientHeight - pathHeight + HEIGHT_OFFSET}, ${endX} ${deck.clientHeight + HEIGHT_OFFSET}`);
    fixAllPos();
  }
  return { addCard, fixPath, cards };
}

//Program entry
let cardManager = cardManagerFactory();

//input element stuff
let cardInput = document.getElementById("cardInput");
cardInput.addEventListener("change", onChange);
for (let i = 1; i <= 6; i++) {
  cardManager.addCard(`Card ${i}`);
}
cardInput.value = cardManager.cards.length;
function onChange(event) {
  if (cardManager.cards.length > event.target.value) {
    let tmp = cardManager.cards.pop();
    tmp.remove();
    cardManager.fixPath();
  } else {
    cardManager.addCard(`Card ${event.target.value}`);
  }
}
