import * as PIXI from 'pixi.js'

export default class extends PIXI.Container {
  constructor() {
    super();
    this.createSpritesheet();
    this.createSlices();
    this.createAnchor();
  }
  createSpritesheet(texture) {
    this.spriteSheet = new PIXI.Sprite(texture);
    this.spriteSheet.interactive = true;
    this.spriteSheet.buttonMode  = true;
    this.spriteSheet.mousedown = function() {
      this.alpha = 0.8;
      this.dragging = true;
    };
    this.spriteSheet.mouseup = this.spriteSheet.mouseupoutside = function() {
      this.alpha = 1;
      this.dragging = false;
      this.data = null;
    };
    this.spriteSheet.mousemove = function(event) {
      if(this.dragging) {
        var mouse = event.data.originalEvent;
        this.parent.x += mouse.movementX;
        this.parent.y += mouse.movementY;
      }
    };
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
  drawSlices(cols, rows) {
    if (this.spriteSheet.width === 0 || this.spriteSheet.height === 0) return;
    this.spriteSlices.clear();
    this.spriteSlices.beginFill(0x000000, 1);
    for (let i = 1; i < cols; i++) {
      let x = i * (this.spriteSheet.width / cols);
      this.spriteSlices.drawRect(x, 0, 1, this.spriteSheet.height);
    }
    for (let i = 1; i < rows; i++) {
      let y = i * (this.spriteSheet.height / rows);
      this.spriteSlices.drawRect(0, y, this.spriteSheet.width, 1);
    }
    this.spriteSlices.endFill();
    this.drawIndexes(cols, rows);
  }
  drawIndexes(cols, rows) {
    let style = {
      fontWeight: 'bold',
      fontSize: '12px',
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: "1"
    }
    let canvas  = document.createElement('canvas');
    canvas.width = this.spriteSheet.width;
    canvas.height = this.spriteSheet.height;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "#FFFFFF";
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let i = x + y * cols;
        let x2 = x * this.spriteSheet.width / cols + 2;
        let y2 = y * this.spriteSheet.height / rows + 2;
        ctx.fillText(i, x2, y2 + 8);
      }
    }
    this.spriteIndexes.texture = new PIXI.Texture.fromCanvas(canvas);
  }
  drawAnchor(cols, rows, anchorX, anchorY) {
    this.spriteAnchor.x = this.spriteSheet.width / cols * anchorX;
    this.spriteAnchor.y = this.spriteSheet.height / rows * anchorY;
  }
  setSpriteSheet(texture) {
    this.spriteSheet.texture = texture;
  }
  onWheel(deltaY, mouseX, mouseY) {
    let localPos = this.toLocal(new PIXI.Point(mouseX, mouseY));
    if (deltaY < 0) {
      this.scale.x = Math.min(this.scale.x + 0.10, 10);
      this.scale.y = Math.min(this.scale.y + 0.10, 10);
    } else {
      this.scale.x = Math.max(this.scale.x - 0.10, 0.1);
      this.scale.y = Math.max(this.scale.y - 0.10, 0.1);
    }
    this.x = -(localPos.x * this.scale.x) + mouseX;
    this.y = -(localPos.y * this.scale.y) + mouseY;
  }
}
