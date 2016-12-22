import React from 'react'
import Manager from '../manager'
import {ipcRenderer} from 'electron'
import * as PIXI from 'pixi.js'
import Stage from '../graphics/stage'

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      width: ipcRenderer.sendSync('getContentSize')[0],
      height: ipcRenderer.sendSync('getContentSize')[1],
      left: 0
    }
    this.config = {};
    this.onResize = ::this.onResize;
    this.onLoaded = ::this.onLoaded;
    this.updatePIXI = ::this.updatePIXI;
  }
  componentWillMount() {
    ipcRenderer.on('resize', this.onResize);
    Manager.on('LOADED', this.onLoaded);
  }
  componentDidMount() {
    this.setupPIXI();
    requestAnimationFrame(this.updatePIXI);
  }
  setupPIXI() {
    PIXI.utils.skipHello();
    this.renderer = PIXI.autoDetectRenderer(this.state.width, this.state.height, {
      view: this.refs.pixiCanvas,
      backgroundColor: 0x1F1F1F,
      antialias: true
    })
    this.stage = new Stage(this.state.width, this.state.height);
  }
  onResize(event, width, height) {
    width = width - this.state.left;
    this.setState({ width, height });
    this.renderer.resize(width, height);
  }
  onLoaded() {
    this.setState({ left: 225 });
    this.renderer.resize(this.state.width - 225, this.state.height);
  }
  onWheel(event) {
    let x = event.pageX - event.target.offsetLeft;
    let y = event.pageY - event.target.offsetTop;
    this.stage.onWheel(event.deltaY, x, y);
  }
  updatePIXI() {
    this.stage.update();
    this.renderer.render(this.stage);
    requestAnimationFrame(this.updatePIXI);
  }
  render() {
    let style = {
      left: this.state.left,
    }
    return (
      <canvas
        ref='pixiCanvas'
        style={style}
        onWheel={::this.onWheel}>
      </canvas>
    )
  }
}
