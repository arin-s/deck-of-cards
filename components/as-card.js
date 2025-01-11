"use strict";
class Card extends HTMLElement {
  shadowRoot = "sd";
  top;
  left;
  rotate;
  state = "onPath";
  downOffsetX;
  downOffsetY;
  onPointerMoveReference;
  timeoutID;

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
    this.addEventListener("pointerdown", this.onPointerDown);
    this.onPointerMoveReference = this.onPointerMove.bind(this);
    document.addEventListener("pointerup", this.onPointerUp.bind(this));
    document.addEventListener("pointercancel", ()=>{console.log("cancel")});
  }

  onPointerDown(event) {
    event.preventDefault();
    if (!event.button === 0) return;
    this.state = "dragged";
    this.downOffsetX = event.offsetX;
    this.downOffsetY = event.offsetY;
    this.setPointerCapture(event.pointerId);
    this.addEventListener("pointermove", this.onPointerMoveReference);
    this.timeoutID = setInterval(this.dragAnimation.bind(this), 16.6);
  }

  prevX = null;
  //Calculates pointer velocity and updates card rotation
  dragAnimation() {
    if (this.prevX === null) {
      this.style.rotate = "0deg";
    } else {
      let delta =  this.currX - this.prevX;
      this.style.rotate = `${delta * 2}deg`;
    }
    this.prevX = this.currX;
  }

  //Records event.x for dragAnimation and updates card position

  onPointerMove(event) {
    this.style.top = `${event.y - this.downOffsetY}px`;
    this.style.left = `${event.x - this.downOffsetX}px`;
    this.currX = event.x;
  }

  onPointerUp(event) {
    if (this.state !== "dragged") return;
    this.state = "onPath";
    document.removeEventListener("pointermove", this.onPointerMoveReference);
    clearTimeout(this.timeoutID);
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
