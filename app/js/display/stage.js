import Store from '../manager/store'
import { observe } from 'mobx'
import path from 'path'

import SpriteSheet from './spritesheet'
import AnimatedSprite from './animated'

class Stage extends PIXI.Container {
  constructor() {
    super();
    this.addListeners();
    this.createNotLoadedText();
    this.createSpritesheet();
    this.createAnimatedSprite();
  }
  addListeners() {
    observe(Store, 'isLoaded', ::this.onLoadedChange);
    observe(Store, 'currentConfig', ::this.onCurrentConfigChange);
    observe(Store, 'currentPose', ::this.onCurrentPoseChange);
  }
  createNotLoadedText() {
    this.notLoadedText = new PIXI.Text('Begin by opening a file.', {
      align: 'center',
      fill: '#F6F6F6'
    })
    this.notLoadedText.anchor.x = 0.5;
    this.notLoadedText.anchor.y = 0.5;
    this.addChild(this.notLoadedText);
  }
  createSpritesheet() {
    this.spriteSheet = new SpriteSheet();
    this.spriteSheet.x = 475;
    this.spriteSheet.y = 50;
    this.spriteSheet.alpha = 0;
    this.addChild(this.spriteSheet);
  }
  createAnimatedSprite() {
    this.previewText = new PIXI.Text("Preview", {
      fontWeight: 'bold',
      fontSize: '12px',
      fill: '#F6F6F6',
      stroke:'#000000',
      strokeThickness: '0.5',
      align: 'center',
    });
    this.previewText.y -= 20;
    this.animatedSprite = new AnimatedSprite();
    this.animatedSprite.y = 20;
    this.animatedSprite.x = 360;
    this.animatedSprite.alpha = 0;
    this.animatedSprite.addChild(this.previewText);
    this.addChild(this.animatedSprite);
  }
  onResize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.centerSprites();
  }
  onLoadedChange(change) {
    if (change.newValue) {
      if (!this.notLoadedText) return;
      this.removeChild(this.notLoadedText);
      this.notLoadedText.destroy(true);
      this.notLoadedText = null;
    } else {
      if (this.notLoadedText) return;
      this.createNotLoadedText();
      this.centerSprites();
    }
  }
  onCurrentConfigChange(change) {
    if (this._observing) {
      this._observing();
      this._observing = null;
    }
    const { config } = Store;
    if (config !== null) {
      this.spriteSheet.alpha = 1;
      this._observing = observe(config, (change) => {
        const { name } = change;
        if (name === 'cols' || name === 'rows') {
          this.animatedSprite.setColsRows(config.cols, config.rows);
          this.setSlices();
        }
        if (name === 'anchorX' || name === 'anchorY') {
          this.setAnchor();
        }
        if (name === 'sampleImg') {
          this.setImage();
        }
      })
      this.animatedSprite.setColsRows(config.cols, config.rows);
      this.setSlices();
      this.setAnchor();
      this.setImage();
    } else {
      this.spriteSheet.alpha = 0;
      this.animatedSprite.alpha = 0;
    }
  }
  onCurrentPoseChange(change) {
    if (this._observingB) {
      this._observingB();
      this._observingB = null;
    }
    const { config } = Store;
    if (config === null) return;
    if (change.newValue !== -1) {
      const { pose } = Store;
      this._observingB = observe(pose, (change) => {
        const { name } = change;
        if (name === 'speed') {
          this.animatedSprite.speed = change.newValue;
        }
        if (name === 'pattern') {
          this.animatedSprite.setPattern(change.newValue);
        }
      })
      this.spriteSheet.setSelectable(true);
      this.animatedSprite.alpha = 1;
      this.animatedSprite.speed = pose.speed;
      this.animatedSprite.setPattern(pose.pattern);
    } else {
      this.spriteSheet.setSelectable(false);
      this.animatedSprite.alpha = 0;
    }
  }
  zoomAt(mouseX, mouseY, deltaY) {
    if (this.spriteSheet.alpha === 1) {
      this.spriteSheet.zoomAt(mouseX, mouseY, deltaY);
    }
  }
  setImage() {
    const { config } = Store;
    const { sampleImg } = config;
    if (sampleImg) {
      const fileName = encodeURIComponent(path.basename(sampleImg));
      const filepath = path.join(path.dirname(sampleImg), fileName);
      let loader = new PIXI.loaders.Loader()
        .add(fileName, filepath)
        .load((loader, resources) => {
          if (resources[fileName].error) {
            this.spriteSheet.setSpriteSheet(PIXI.Texture.EMPTY);
            this.animatedSprite.texture = PIXI.Texture.EMPTY;
          } else {
            this.spriteSheet.setSpriteSheet(resources[fileName].texture);
            this.animatedSprite.texture = new PIXI.Texture(resources[fileName].texture.baseTexture);
            this.setSlices();
          }
        })
      loader = null;
    } else {
      this.spriteSheet.setSpriteSheet(PIXI.Texture.EMPTY);
      this.animatedSprite.texture = PIXI.Texture.EMPTY;
    }
  }
  setSlices() {
    const {
      cols, rows,
      anchorX, anchorY
    } = Store.config;
    this.spriteSheet.drawSlices(Number(cols) || 1, Number(rows) || 1);
    this.setAnchor();
  }
  setAnchor() {
    const { config } = Store;
    const {
      cols, rows,
      anchorX, anchorY
    } = config;
    this.spriteSheet.drawAnchor(Number(cols) || 1, Number(rows) || 1,
      Number(anchorX) || 0, Number(anchorY) || 0);
  }
  getSprite() {
    let sprite = new PIXI.Sprite();
    sprite.texture = new PIXI.Texture(this.spriteSheet.spriteSheet.texture.baseTexture);
    return sprite;
  }
  getSlice(i) {
    let slice = this.getSprite();
    const { config } = Store;
    const cols = Number(config.cols) || 1;
    const rows = Number(config.rows) || 1;
    const width = slice.width;
    const height = slice.height;
    if (width === 0 || height === 0) return slice;
    const frameW = width / cols;
    const frameH = height / rows;
    let x = i % cols;
    let y = Math.floor(i / cols);
    x *= frameW;
    y *= frameH;
    if (x + frameW <= width && y + frameH <= height) {
      slice.texture.frame = new PIXI.Rectangle(x, y, frameW, frameH);
    }
    return slice;
  }
  centerSprites() {
    if (this.notLoadedText) {
      this.notLoadedText.x = this.canvasWidth / 2;
      this.notLoadedText.y = this.canvasHeight / 2;
    }
  }
  update() {
    this.animatedSprite.update();
  }
}

export default new Stage();
