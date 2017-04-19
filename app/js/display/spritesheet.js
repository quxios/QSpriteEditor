import Manager from '../manager'

const ZOOM_AMT = 0.2;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

export default class SpriteSheet extends PIXI.Container {
  constructor() {
    super();
    this._selectable = false;
    this.createSpritesheet();
    this.createSlices();
    this.createAnchor();
    this.createHighlight();
  }
  createSpritesheet() {
    this.spriteSheet = new PIXI.Sprite();
    this.spriteSheet.interactive = true;
    this.spriteSheet.buttonMode = false;
    this.spriteSheet.on('click', ::this.onClick);
    this.spriteSheet.on('mouseover', ::this.onOver);
    this.spriteSheet.on('mousemove', ::this.onMove);
    this.spriteSheet.on('mouseout', ::this.onOut);
    this.addChild(this.spriteSheet);
  }
  createSlices() {
    this.spriteSlices = new PIXI.Graphics();
    this.addChild(this.spriteSlices);
    this.spriteIndexes = new PIXI.Sprite();
    this.addChild(this.spriteIndexes);
  }
  createAnchor() {
    this.spriteAnchor = new PIXI.Graphics();
    this.spriteAnchor.beginFill(0xFF0000, 0.5);
    this.spriteAnchor.drawRect(-1, 0, 3, 1);
    this.spriteAnchor.drawRect(0, -1, 1, 3);
    this.spriteAnchor.endFill();
    this.addChild(this.spriteAnchor);
  }
  createHighlight() {
    this.spriteHighlight = new PIXI.Graphics();
    this.spriteHighlight.alpha = 0;
    this.addChild(this.spriteHighlight);
  }
  drawSlices(cols, rows) {
    this._cols = cols;
    this._rows = rows;
    const {
      width, height
    } = this.spriteSheet;
    if (width === 0 || height === 0) return;
    this.spriteSlices.clear();
    this.spriteSlices.beginFill(0x000000, 1);
    for (let i = 1; i < cols; i++) {
      let x = i * (width / cols);
      this.spriteSlices.drawRect(x, 0, 1, height);
    }
    for (let i = 1; i < rows; i++) {
      let y = i * (height / rows);
      this.spriteSlices.drawRect(0, y, width, 1);
    }
    this.spriteSlices.endFill();
    this.spriteHighlight.clear();
    this.spriteHighlight.lineStyle(1, 0x03A9F4);
    this.spriteHighlight.drawRect(0, 0, width / cols, height / rows);
    this.spriteHighlight.endFill();
    this.drawIndexes(cols, rows);
  }
  drawIndexes(cols, rows) {
    let canvas  = document.createElement('canvas');
    canvas.width = this.spriteSheet.width;
    canvas.height = this.spriteSheet.height;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Roboto';
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let i = x + y * cols;
        let x2 = x * this.spriteSheet.width / cols + 2;
        let y2 = y * this.spriteSheet.height / rows + 2;
        ctx.fillText(i, x2, y2 + 12);
      }
    }
    this.spriteIndexes.texture = new PIXI.Texture.fromCanvas(canvas);
  }
  drawAnchor(cols, rows, anchorX, anchorY) {
    const {
      width, height
    } = this.spriteSheet;
    if (width === 0 || height === 0) return;
    this.spriteAnchor.x = width / cols * anchorX;
    this.spriteAnchor.y = height / rows * anchorY;
  }
  setSpriteSheet(texture) {
    this.spriteSheet.texture = texture;
  }
  zoomAt(x, y, deltaY) {
    const localPos = this.toLocal(new PIXI.Point(x, y));
    if (deltaY < 0) {
      this.scale.x = Math.min(this.scale.x + ZOOM_AMT, ZOOM_MAX);
      this.scale.y = Math.min(this.scale.y + ZOOM_AMT, ZOOM_MAX);
    } else {
      this.scale.x = Math.max(this.scale.x - ZOOM_AMT, ZOOM_MIN);
      this.scale.y = Math.max(this.scale.y - ZOOM_AMT, ZOOM_MIN);
    }
    this.x = -(localPos.x * this.scale.x) + x;
    this.y = -(localPos.y * this.scale.y) + y;
  }
  onClick(event) {
    if (!this._selectable) return;
    if (event.data.originalEvent.button !== 0) return;
    const pos = event.data.getLocalPosition(this);
    const {
      width, height
    } = this.spriteSheet;
    if (width === 0 || height === 0) return;
    const x = Math.floor(pos.x / (width / this._cols));
    const y = Math.floor(pos.y / (height / this._rows));
    const i = x + y * this._cols;
    Manager.addPattern(i);
  }
  onOver(event) {
    if (!this._selectable) return;
    this.spriteHighlight.alpha = 1;
  }
  onMove(event) {
    if (!this._selectable) return;
    const pos = event.data.getLocalPosition(this);
    const {
      width, height
    } = this.spriteSheet;
    if (width === 0 || height === 0) return;
    const pw = width / this._cols;
    const ph = height / this._rows;
    const x = Math.floor(pos.x / pw);
    const y = Math.floor(pos.y / ph);
    this.spriteHighlight.x = x * pw;
    this.spriteHighlight.y = y * ph;
  }
  onOut() {
    this.spriteHighlight.alpha = 0;
  }
  setSelectable(bool) {
    this._selectable = bool;
    this.spriteSheet.buttonMode = bool;
    if (!bool) {
      this.onOut();
    }
  }
}
