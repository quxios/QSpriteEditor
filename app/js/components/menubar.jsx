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
      filters: [{ name: 'json', extensions: ['json'] }]
    }, (fileNames) => {
      if (!fileNames) return;
      let json = JSON.parse(fs.readFileSync(fileNames[0], 'utf8'));
      if (!Manager.loadJson(json)) {
        alert('ERROR: Invalid JSON file.');
      }
    })
  }
  onSave() {
    if (this.state.loaded) {
      remote.dialog.showSaveDialog({
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
        <button onClick={this.onNew.bind(this)} className='pointer'>New</button>
        <button onClick={this.onLoad.bind(this)} className='pointer'>Load</button>
        <button onClick={this.onSave.bind(this)} className={saveClass}>Save</button>
      </div>
    )
  }
}
