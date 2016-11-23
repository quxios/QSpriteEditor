import React from 'react'
import Manager from '../manager'
import {ipcRenderer} from 'electron'

export default class ContextMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      items: [],
      top: 0,
      left: 0,
      visible: false,
      width: ipcRenderer.sendSync('getContentSize')[0],
      height: ipcRenderer.sendSync('getContentSize')[1]
    }
    this.setItems = this.setItems.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.setVisible = this.setVisible.bind(this);
    this.onResize = this.onResize.bind(this);
  }
  componentWillMount() {
    Manager.on('SET_CONTEXT_ITEMS', this.setItems);
    Manager.on('SET_CONTEXT_POS', this.setPosition);
    Manager.on('SET_CONTEXT_VISIBLE', this.setVisible);
    ipcRenderer.on('resize', this.onResize);
  }
  onResize(event, width, height) {
    this.setState({ width, height });
  }
  setVisible(visible) {
    this.setState({ visible });
  }
  setItems(items) {
    this.setState({ items });
  }
  setPosition(top, left) {
    this.setState({ top, left });
  }
  onVeilClick() {
    Manager.emit('SET_CONTEXT_VISIBLE', false);
  }
  render() {
    const style = {
      top: this.state.top,
      left: this.state.left,
      display: this.state.visible ? 'block' : 'none'
    }
    const veilStyle = {
      width: this.state.width,
      height: this.state.height,
      display: this.state.visible ? 'block' : 'none'
    }
    const items = this.state.items.map((item, i) => {
      let title = item.title;
      let handler = item.handler;
      return <div key={i} onClick={handler} className='item'>{title}</div>;
    })
    return (
      <div>
        <div
          className='veil'
          style={veilStyle}
          onClick={this.onVeilClick.bind(this)}>
        </div>
        <div className='contextMenu' style={style}>
          {items}
        </div>
      </div>
    )
  }
}
