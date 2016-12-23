import React from 'react'
import Manager from '../manager'
import {ipcRenderer} from 'electron'

import ConfigList from './toolbarConfigList'
import Settings from './toolbarSettings'
import PoseSettings from './toolbarPoseSettings'
import ContextMenu from './contextMenu'

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      path: '',
      height: ipcRenderer.sendSync('getContentSize')[1] - 34
    }
    this.onResize = ::this.onResize;
    this.onUpdatePath = ::this.onUpdatePath;
  }
  componentWillMount() {
    ipcRenderer.on('resize', this.onResize);
    Manager.on('UPDATE_TOOLPATH', this.onUpdatePath);
  }
  onResize(event, width, height) {
    height -= 34;
    this.setState({ height })
  }
  onUpdatePath(path) {
    this.setState({ path })
  }
  goTo(path) {
    switch (path) {
      case 'Configs': {
        Manager.setToolPath('configList');
        Manager.setPoseScrollTop(0);
        break;
      }
      case 'Settings': {
        Manager.setToolPath('settings');
        break;
      }
    }
  }
  render() {
    let toolbar = null;
    let navi = [];
    switch (this.state.path) {
      case 'configList': {
        toolbar = <ConfigList height={this.state.height} />;
        navi = ['Configs'];
        break;
      }
      case 'settings': {
        toolbar = <Settings height={this.state.height} />;
        navi = ['Configs', 'Settings'];
        break;
      }
      case 'poseSettings': {
        toolbar = <PoseSettings height={this.state.height} />;
        navi = ['Configs', 'Settings', 'Pose'];
        break;
      }
    }
    navi = navi.map((v, i) => {
      if (i !== navi.length - 1) {
        return (
          <span key={i}>
            <span className='navi pointer' onClick={this.goTo.bind(this, v)}>
              {v}
            </span> / </span>
          )
      }
      return <span className='navi' key={i}>{v}</span>;
    })
    return (
      <div className='toolbar'>
        <div className='padded'>
          <div className='header'>
            {navi}
          </div>
          { toolbar }
          <ContextMenu />
        </div>
      </div>
    )
  }
}
