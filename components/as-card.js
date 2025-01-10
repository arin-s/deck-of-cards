"use strict";
class Card extends HTMLElement {
  shadowRoot = "sd";
  top;
  left;
  rotate;
  state;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let template = document.createElement("template");
    template.innerHTML = `
      <link rel="stylesheet" href="components/as-card.css">
      <div class="card-focus-field">
        <div class="rotate-x">
          <div class="rotate-y card"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.addEventListener("get-width", () => {
      let width = this.shadowRoot.querySelector(".card").clientWidth;
      this.dispatchEvent(
        new CustomEvent("send-width", {
          composed: true, bubbles: true,
          detail: { width: width },
        })
      );
    });
    this.addEventListener("set-pos", (event) => {
      this.top = event.detail.top;
      this.left = event.detail.left;
      this.rotate = event.detail.rotate;
      this.tryUpdatePos();
    });
  }
  tryUpdatePos() {
      //Add state handling code
      if(this.state === "onPath") {

      }
      if(this.state === "onPath") {

      }
  }
}

customElements.define("as-card", Card);
