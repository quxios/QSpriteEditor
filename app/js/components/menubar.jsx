import React from 'react'
import Manager from '../manager'
import {remote} from 'electron'
import fs from 'fs'

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false
    }
  }
  componentWillMount() {
    Manager.on('LOADED', () => {
      this.setState({ loaded: true })
    })
  }
  onNew() {
    Manager.startNew();
  }
  onLoad() {
    remote.dialog.showOpenDialog({
      defaultPath: Manager.state.filePath,
      filters: [{ name: 'json', extensions: ['json'] }]
    }, (fileNames) => {
      if (!fileNames) return;
      if (!Manager.loadFile(fileNames[0])) {
        alert('ERROR: Invalid JSON file.');
      }
    })
  }
  onSave() {
    if (this.state.loaded) {
      remote.dialog.showSaveDialog({
        defaultPath: Manager.state.filePath,
        filters: [{ name: 'json', extensions: ['json'] }]
      }, (fileName) => {
        if (fileName) {
          fs.writeFileSync(fileName, Manager.getJson());
        }
      })
    }
  }
  doLoad() {

  }
  doSave() {

  }
  render() {
    let saveClass = 'pointer';
    if (!this.state.loaded) {
      saveClass += ' disabled';
    }
    return (
      <div className="menubar">
        <button onClick={::this.onNew} className='pointer'>New</button>
        <button onClick={::this.onLoad} className='pointer'>Load</button>
        <button onClick={::this.onSave} className={saveClass}>Save</button>
      </div>
    )
  }
}
