import * as PIXI from 'pixi.js'
import Manager from '../manager'

export default class extends PIXI.Sprite {
  constructor() {
    super();
    this.cols = 0;
    this.rows = 0;
    this.speed = 15;
    this.pattern = [];
    this.tick = 0;
    this.frame = 0;
    Manager.on('SET_ANIMATED_PATTERN', (pattern) => {
      this.pattern = pattern;
    })
    Manager.on('SET_ANIMATED_ALPHA', (alpha) => {
      this.alpha = alpha;
      if (alpha === 1) {
        this.updateFrame();
      }
    })
  }
  setPattern(pattern) {
    this.pattern = pattern;
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
    let width = this.texture.baseTexture.width;
    let height = this.texture.baseTexture.height;
    let frameW = Math.floor(width / this.cols);
    let frameH = Math.floor(height / this.rows);
    let index = this.pattern[this.frame] || 0;
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
