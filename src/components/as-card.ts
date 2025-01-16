'use strict';
class Card extends HTMLElement {
  shadowRoot = 'sd';
  top;
  left;
  rotate;
  state = 'onPath';
  downOffsetX;
  downOffsetY;
  timeoutID;

  constructor () {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
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
    this.addEventListener('get-width', () => {
      const width = this.shadowRoot.querySelector('.card').clientWidth;
      this.dispatchEvent(
        new CustomEvent('send-width', {
          composed: true,
          bubbles: true,
          detail: { width },
        })
      );
    });
    this.addEventListener('set-pos', (event) => {
      this.top = event.detail.top;
      this.left = event.detail.left;
      this.rotate = event.detail.rotate;
      this.tryUpdatePos();
    });
    this.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointerup', this.onPointerUp.bind(this));
    document.addEventListener('pointercancel', () => { console.log('pointercancel'); });
    document.addEventListener('lostpointercapture', () => { console.log('lostpointercapture'); });
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      console.log('contextmenu');
    });
  }

  onPointerDown (event) {
    event.preventDefault();
    if (!(event.button === 0)) return;
    this.state = 'dragged';
    this.downOffsetX = event.offsetX;
    this.downOffsetY = event.offsetY;
    this.setPointerCapture(event.pointerId);
    this.onpointermove = this.onPointerMove;
    this.timeoutID = setInterval(this.dragAnimation.bind(this), 16.6);
    console.log(`CALLED ID ${this.timeoutID}`);
  }

  prevX = null;
  // Calculates pointer velocity and updates card rotation
  dragAnimation () {
    if (this.prevX === null) {
      this.style.rotate = '0deg';
    } else {
      const delta = this.currX - this.prevX;
      this.style.rotate = `${delta * 2}deg`;
    }
    this.prevX = this.currX;
    console.log('animation');
  }

  // Records event.x for dragAnimation and updates card position

  onPointerMove (event) {
    this.style.top = `${event.y - this.downOffsetY}px`;
    this.style.left = `${event.x - this.downOffsetX}px`;
    this.currX = event.x;
  }

  onPointerUp (event) {
    if (this.state !== 'dragged') return;
    this.state = 'onPath';
    this.onpointermove = null;
    clearInterval(this.timeoutID);
    this.tryUpdatePos();
  }

  tryUpdatePos () {
    // Add state handling code
    if (this.state === 'onPath') {
      console.log('updatePos');
      this.style.top = this.top;
      this.style.left = this.left;
      this.style.rotate = this.rotate;
    }
    if (this.state === 'dragged') {
      // ignore
    }
  }
}

customElements.define('as-card', Card);
