"use strict";

class Card extends HTMLElement {
  shadowRoot: ShadowRoot;
  top: number | null = null;
  left: number | null = null;
  rotate: string = "";
  state: "inDeck" | "drag" | "inSocket" = "inDeck";
  downOffsetX: number = 0;
  downOffsetY: number = 0;
  timeoutID: number = 0;
  prevX: number | null = null;
  currX: number | null = null;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = `
      <link rel="stylesheet" href="src/components/as-card.css">
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
      const card = this.shadowRoot.querySelector(".card");
      if (card === null) throw new Error("Inner card element not present!");
      const width = card.clientWidth;
      this.dispatchEvent(
        new CustomEvent("send-width", {
          composed: true,
          bubbles: true,
          detail: { width },
        }),
      );
    });
    this.addEventListener("set-pos", ((
      event: CustomEvent<{ top: number; left: number; rotate: string }>,
    ) => {
      this.top = event.detail.top;
      this.left = event.detail.left;
      this.rotate = event.detail.rotate;
      if (this.state === "inDeck") this.setPos(this.top, this.left);
    }) as EventListener);
    this.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointerup", this.onPointerUp.bind(this));
    document.addEventListener("pointercancel", () => {
      console.log("pointercancel");
    });
    document.addEventListener("lostpointercapture", () => {
      console.log("lostpointercapture");
    });
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      console.log("contextmenu");
    });
  }

  // On left click/tap, enter drag state
  onPointerDown(event: PointerEvent) {
    event.preventDefault();
    if (!(event.button === 0)) return;
    this.state = "drag";
    this.downOffsetX = event.offsetX;
    this.downOffsetY = event.offsetY;
    this.setPointerCapture(event.pointerId);
    this.onpointermove = this.onPointerMove.bind(this);
    this.setPos(event.y - this.downOffsetY, event.x - this.downOffsetX, true);
    this.prevX = null;
    this.currX = null;
    this.dragAnimation();
    this.timeoutID = setInterval(this.dragAnimation.bind(this), 16.6); // Call 30 times per second
    console.log(`CALLED ID ${this.timeoutID.toString()}`);
  }

  // Calculates pointer velocity and updates card rotation
  dragAnimation() {
    if (this.currX === null) return;
    if (this.prevX === null) {
      this.style.rotate = "0deg";
    } else {
      const delta = this.currX - this.prevX;
      this.style.rotate = `${(delta * 2).toString()}deg`;
    }
    this.prevX = this.currX;
  }

  // Records event.x for dragAnimation and updates card position
  onPointerMove(event: PointerEvent) {
    this.setPos(event.y - this.downOffsetY, event.x - this.downOffsetX);
    this.currX = event.x;
  }

  onPointerUp() {
    if (this.state !== "drag") return;
    if (this.top === null || this.left === null)
      throw new Error("Card coordinates are null!");
    this.state = "inDeck";
    this.onpointermove = null;
    clearInterval(this.timeoutID);
    this.setPos(this.top, this.left);
  }

  setPos(top: number, left: number, instant: boolean = false) {
    if (instant) {
      this.style.top = `${top.toString()}px`;
      this.style.left = `${left.toString()}px`;
    } else {
      //do slow anim
      this.style.top = `${top.toString()}px`;
      this.style.left = `${left.toString()}px`;
    }
  }
}

customElements.define("as-card", Card);
