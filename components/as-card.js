"use strict";
class Card extends HTMLElement {
  shadowRoot = "sd";
  top;
  left;
  rotate;
  state = "onPath";
  downOffsetX;
  downOffsetY;
  onMouseMoveReference;


  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let template = document.createElement("template");
    template.innerHTML = `
      <link rel="stylesheet" href="components/as-card.css">
      <div class="card-focus-field">
        <div class="rotate-x">
          <div class="rotate-y card">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.addEventListener("get-width", () => {
      let width = this.shadowRoot.querySelector(".card").clientWidth;
      this.dispatchEvent(
        new CustomEvent("send-width", {
          composed: true,
          bubbles: true,
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
    this.addEventListener("mousedown", this.onMouseDown);
    this.onMouseMoveReference = this.onMouseMove.bind(this);
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    if(!event.button === 0)
      return;
    this.state = "dragged";
    this.downOffsetX = event.offsetX;
    this.downOffsetY = event.offsetY;
    document.addEventListener("mousemove", this.onMouseMoveReference);
    
  }

  prevX = null;
  onMouseMove(event) {
    this.style.top = `${event.y - this.downOffsetY}px`;
    this.style.left = `${event.x - this.downOffsetX}px`;
    this.style.rotate = "0deg";
    if(this.prevX !== null) {
      this.rotate = 0;
    }

  }

  onMouseUp(event) {
    if(this.state !== "dragged")
      return;
    this.state = "onPath";
    document.removeEventListener("mousemove", this.onMouseMoveReference);
    this.tryUpdatePos();
  }

  tryUpdatePos() {
    //Add state handling code
    if (this.state === "onPath") {
      this.style.top = this.top;
      this.style.left = this.left;
      this.style.rotate = this.rotate;
    }
    if (this.state === "dragged") {
      //ignore
    }
  }
}

customElements.define("as-card", Card);
