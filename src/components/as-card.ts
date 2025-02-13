"use strict";

class Card extends HTMLElement {
  shadowRoot: ShadowRoot;
  top: string = "";
  left: string = "";
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
      event: CustomEvent<{ top: string; left: string; rotate: string }>,
    ) => {
      this.top = event.detail.top;
      this.left = event.detail.left;
      this.rotate = event.detail.rotate;
      this.tryUpdatePos();
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
    this.setPos(event.y - this.downOffsetY, event.x - this.downOffsetX);
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
    this.state = "inDeck";
    this.onpointermove = null;
    clearInterval(this.timeoutID);
    this.tryUpdatePos();
  }

  tryUpdatePos() {
    // Add state handling code
    if (this.state === "inDeck") {
      console.log("updatePos");
      this.style.top = this.top;
      this.style.left = this.left;
      this.style.rotate = this.rotate;
    }
    if (this.state === "drag") {
      // ignore
    }
  }

  setPos(top: number, left: number) {
    this.style.top = `${top.toString()}px`;
    this.style.left = `${left.toString()}px`;
  }
}

customElements.define("as-card", Card);
