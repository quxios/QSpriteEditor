import React from 'react'
import Manager from '../manager'

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      selected: ''
    }
    this.updateJson = ::this.updateJson;
    this.onContextVisible = ::this.onContextVisible;
  }
  componentDidMount() {
    Manager.on('UPDATE_JSON', this.updateJson);
    Manager.on('SET_CONTEXT_VISIBLE', this.onContextVisible);
    Manager.emit('UPDATE_JSON', Manager.state.json);
  }
  componentWillUnmount() {
    Manager.remove('UPDATE_JSON', this.updateJson);
    Manager.remove('SET_CONTEXT_VISIBLE', this.onContextVisible);
    Manager.remove('HIDE_CONTEXT', this.onHideContext);
    Manager.setConfigScrollTop(this.divList.scrollTop);
  }
  componentDidUpdate() {
    if (this.scrollToBottom) {
      this.divList.scrollTop = this.divList.scrollHeight;
      this.scrollToBottom = false;
    }
    if (!this.scrollSet) {
      this.divList.scrollTop = Manager.getConfigScrollTop();
      this.scrollSet = true;
    }
  }
  updateJson(json) {
    let list = Object.keys(json);
    this.setState({ list });
    if (list.length > this.state.list.length) {
      this.scrollToBottom = true;
    }
  }
  onClick(item) {
    Manager.setConfig(item);
    Manager.setToolPath('settings');
  }
  onContext(item, event) {
    let items = [
      { title: 'Duplicate', handler: this.onDuplicate.bind(this, item) },
      { title: 'Delete', handler: this.onDelete.bind(this, item) }
    ]
    Manager.addContext(items, event.pageX, event.pageY);
    this.setState({ selected: item });
  }
  onContextVisible(visible) {
    if (!visible) {
      this.setState({ selected: '' });
    }
  }
  onDuplicate(item) {
    Manager.duplicateConfig(item);
    Manager.emit('SET_CONTEXT_VISIBLE', false);
  }
  onDelete(item) {
    Manager.deleteConfig(item);
    Manager.emit('SET_CONTEXT_VISIBLE', false);
  }
  render() {
    let listStyle = {
      height: this.props.height - 100,
      maxHeight: this.props.height - 100,
      overflow: 'auto'
    }
    let list = this.state.list.map((item , i)=> {
      let classes = 'configItem pointer';
      if (this.state.selected === item) {
        classes += ' selected';
      }
      return (
        <div
          key={i}
          className={classes}
          onClick={this.onClick.bind(this, item)}
          onContextMenu={this.onContext.bind(this, item)}>
          {item}
        </div>
      );
    })
    return (
      <div>
        <div style={listStyle} ref={(div) => { this.divList = div; }}>
          {list}
        </div>
        <div className='footer'>
          <button onClick={Manager::Manager.addNewConfig}>Add New</button>
        </div>
      </div>
    )
  }
}
