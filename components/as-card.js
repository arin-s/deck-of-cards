"use strict"

class Card extends HTMLElement {

  constructor() {
    super();

  }

  //Runs every time the element is added to the document
  connectedCallback() {

  }
}

customElements.define("as-card", Card);
