import React from 'react'
import Manager from '../manager'

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      selected: ''
    }
    this.updateJson = this.updateJson.bind(this);
    this.onContextVisible = this.onContextVisible.bind(this);
  }
  componentWillMount() {
    Manager.on('UPDATE_JSON', this.updateJson);
    Manager.on('SET_CONTEXT_VISIBLE', this.onContextVisible);
    Manager.emit('UPDATE_JSON', Manager.state.json);
  }
  componentWillUnmount() {
    Manager.remove('UPDATE_JSON', this.updateJson);
    Manager.remove('SET_CONTEXT_VISIBLE', this.onContextVisible);
    Manager.remove('HIDE_CONTEXT', this.onHideContext);
  }
  updateJson(json) {
    let list = Object.keys(json);
    this.setState({ list });
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
        <div style={listStyle}>
          {list}
        </div>
        <div className='footer'>
          <button onClick={Manager.addNewConfig.bind(Manager)}>Add New</button>
        </div>
      </div>
    )
  }
}
