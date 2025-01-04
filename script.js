"use strict"

//Declarations
let deck = document.getElementById("deck");
let path = document.getElementById("path");



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
