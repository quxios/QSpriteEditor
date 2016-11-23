import Manager from '../manager'
import {ipcRenderer} from 'electron'
import * as PIXI from 'pixi.js'
import SpriteSheet from './spritesheet'
import AnimatedSprite from './animated'

export default class extends PIXI.Container {
  constructor(width, height) {
    super();
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.createNotLoadedText();
    this.createSpritesheet();
    this.createAnimatedSprite();
    this.config = {};
    this.onResize = this.onResize.bind(this);
    this.onLoaded = this.onLoaded.bind(this);
    this.onUpdateConfig = this.onUpdateConfig.bind(this);
    this.onUpdatePath = this.onUpdatePath.bind(this);
    this.addListeners();
  }
  createNotLoadedText() {
    this.notLoadedText = new PIXI.Text('Begin by openning a file.', {
      align: 'center',
      fill: '#F6F6F6'
    });
    this.notLoadedText.anchor.x = 0.5;
    this.notLoadedText.anchor.y = 0.5;
    this.notLoadedText.x = this.canvasWidth / 2;
    this.notLoadedText.y = this.canvasHeight / 2;
    this.addChild(this.notLoadedText);
  }
  createSpritesheet() {
    this.spriteSheet = new SpriteSheet();
    this.spriteSheet.x = 100;
    this.spriteSheet.alpha = 0;
    this.addChild(this.spriteSheet);
  }
  createAnimatedSprite() {
    this.previewText = new PIXI.Text("Preview", {
      fontWeight: 'bold',
      fontSize: '12px',
      fill: "#F6F6F6",
      stroke: "#000000",
      strokeThickness: "0.5",
      align: 'center',
    });
    this.previewText.y -= 20;
    this.animatedSprite = new AnimatedSprite();
    this.animatedSprite.y = 20;
    this.animatedSprite.x = 10;
    this.animatedSprite.alpha = 0;
    this.animatedSprite.addChild(this.previewText);
    this.addChild(this.animatedSprite);
  }
  addListeners() {
    ipcRenderer.on('resize', this.onResize);
    Manager.on('LOADED', this.onLoaded);
    Manager.on('UPDATE_CONFIG', this.onUpdateConfig);
    Manager.on('UPDATE_TOOLPATH', this.onUpdatePath);
  }
  onResize(event, width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    if (!this.notLoadedText) {
      this.canvasWidth -= 255;
    }
    this.centerSprites();
  }
  onUpdatePath(path) {
    if (path === 'settings' || path === 'poseSettings') {
      this.spriteSheet.alpha = 1;
    } else {
      this.spriteSheet.alpha = 0;
      this.animatedSprite.alpha = 0;
      this.spriteSheet.scale = new PIXI.Point(1, 1);
    }
  }
  onLoaded() {
    if (!this.notLoadedText) return;
    this.removeChild(this.notLoadedText);
    this.notLoadedText.destroy(true);
    this.notLoadedText = null;
    this.canvasWidth -= 225;
    this.centerSprites();
  }
  onUpdateConfig(newConfig) {
    if (this.config.sampleImg !== newConfig.sampleImg) {
      this.loadImg(newConfig.sampleImg);
    }
    if (this.config.cols !== newConfig.cols || this.config.rows !== newConfig.rows) {
      this.spriteSheet.drawSlices(newConfig.cols, newConfig.rows);
      this.spriteSheet.drawAnchor(newConfig.cols, newConfig.rows, newConfig.anchorX, newConfig.anchorY);
      this.animatedSprite.cols = newConfig.cols;
      this.animatedSprite.rows = newConfig.rows;
    }
    if (this.config.speed !== newConfig.speed) {
      this.animatedSprite.speed = newConfig.speed;
    }
    if (this.config.anchorX !== newConfig.anchorX || this.config.anchorY !== newConfig.anchorY) {
      this.spriteSheet.drawAnchor(newConfig.cols, newConfig.rows, newConfig.anchorX, newConfig.anchorY);
    }
    this.config = newConfig;
  }
  onWheel(deltaY, mouseX, mouseY) {
    if (this.spriteSheet.alpha === 1) {
      this.spriteSheet.onWheel(deltaY, mouseX, mouseY);
    }
  }
  loadImg(path) {
    if (path) {
      let loader = new PIXI.loaders.Loader()
        .add('sample', path)
        .load((loader, resources) => {
          this.spriteSheet.setSpriteSheet(resources.sample.texture);
          this.animatedSprite.texture = new PIXI.Texture(resources.sample.texture.baseTexture);
          this.spriteSheet.drawSlices(this.config.cols, this.config.rows);
          this.spriteSheet.drawAnchor(this.config.cols, this.config.rows, this.config.anchorX, this.config.anchorY);
        })
      loader = null;
    } else {
      this.spriteSheet.setSpriteSheet(PIXI.Texture.EMPTY);
    }
  }
  centerSprites() {
    if (this.notLoadedText) {
      this.notLoadedText.x = this.canvasWidth / 2;
      this.notLoadedText.y = this.canvasHeight / 2;
    }
  }
  update() {
    this.children.forEach(child => {
      if (typeof child.update === "function") {
        child.update();
      }
    })
  }
}
