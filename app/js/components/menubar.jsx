import React from 'react'
import Manager from '../manager'
import { remote, ipcRenderer } from 'electron'

export default class Menubar extends React.Component {
  openLoad = () => {
    remote.dialog.showOpenDialog({
      title: 'Open Project',
      defaultPath: this.props.projectPath,
      filters: [{
        name: 'RPG Maker MV Project',
        extensions: ['rpgproject'],
      }]
    }, ::Manager.startLoad);
  }
  openHelp = () => {
    ipcRenderer.send('openHelp');
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isLoaded !== this.props.isLoaded;
  }
  render() {
    const {
      isLoaded
    } = this.props;
    return (
      <div className="menubar">
        <div className="left">
          <button onClick={this.openLoad}>
            <i className="fa fa-folder-open-o" aria-hidden />
            Load
          </button>
          { isLoaded &&
            <button onClick={::Manager.save}>
              <i className="fa fa-floppy-o" aria-hidden />
              Save
            </button>
          }
        </div>
        <div className="right">
          <button onClick={this.openHelp}>
            <i className="fa fa-info" aria-hidden />
            Help
          </button>
        </div>
      </div>
    )
  }
}
