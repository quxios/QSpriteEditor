export default class AnimatedSprite extends PIXI.Sprite {
  constructor() {
    super();
    this.cols = 1;
    this.rows = 1;
    this.speed = 15;
    this.pattern = [];
    this.tick = 0;
    this.frame = 0;
  }
  setPattern(pattern) {
    this.pattern = pattern.peek();
    this.tick = 0;
    this.frame = 0;
    this.updateFrame();
  }
  setColsRows(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.tick = 0;
    this.frame = 0;
    this.updateFrame();
  }
  update() {
    if (this.alpha === 0) return;
    if (this.pattern.length === 0) return;
    this.tick++;
    if (this.tick % this.speed === 0) {
      this.updateFrame();
    }
  }
  updateFrame() {
    this.tick = 0;
    const {
      width, height
    } = this.texture.baseTexture;
    if (width === 0 || height === 0) return;
    const frameW = Math.floor(width / this.cols);
    const frameH = Math.floor(height / this.rows);
    const index = this.pattern[this.frame] || 0;
    let x = (index % this.cols);
    let y = ((index - x) / this.cols);
    x *= frameW;
    y *= frameH;
    if (x + frameW <= width && y + frameH <= height) {
      this.texture.frame = new PIXI.Rectangle(x, y, frameW, frameH);
    }
    this.frame++;
    if (this.frame >= this.pattern.length) {
      this.frame = 0;
    }
  }
}
