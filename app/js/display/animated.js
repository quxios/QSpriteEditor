export default class AnimatedSprite extends PIXI.Sprite {
  constructor() {
    super();
    this.cols = 1;
    this.rows = 1;
    this.speed = 15;
    this.pattern = [];
    this.tick = 0;
    this.frame = 0;
    this._frames = [];
    this._realTexture = null;
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
    this.setSprite(this._realTexture);
    this.updateFrame();
  }
  setSprite(texture) {
    this._frames = [];
    this._realTexture = texture;
    if (!texture) return;
    const frameW = texture.width / this.cols;
    const frameH = texture.height / this.rows;
    for (let y = 0; y < this.rows; y++) {
      const y1 = y * frameH;
      for (let x = 0; x < this.cols; x++) {
        const x1 = x * frameW;
        const frame = new PIXI.Rectangle(x1, y1, frameW, frameH);
        this._frames.push(new PIXI.Texture(texture, frame));
      }
    }
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
    if (!this._realTexture || this._frames.length === 0) {
      this.texture = PIXI.Texture.EMPTY;
      return;
    }
    const index = this.pattern[this.frame] || 0;
    const frame = this._frames[index];
    if (frame) {
      this.texture = frame;
    }
    this.frame++;
    if (this.frame >= this.pattern.length) {
      this.frame = 0;
    }
  }
}
