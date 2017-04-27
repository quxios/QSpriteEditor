import React from 'react'
import { observer } from 'mobx-react'
import { remote } from 'electron'

@observer
export default class ConfigProperties extends React.Component {
  updateProperty(key, value) {
    this.props.data[key] = value;
  }
  onChange = (e) => {
    const prop = e.target.name;
    let value = e.target.value;
    if (prop === 'cols' || prop === 'rows') {
      if (!/^[0-9]*$/.test(value)) {
        value = String(this.props.data[prop]);
      }
    }
    if (prop === 'anchorX' || prop === 'anchorY') {
      if (!/^-?[0-9]*(.[0-9]*)?$/.test(value)) {
        value = String(this.props.data[prop]);
      }
    }
    this.updateProperty(prop, value);
  }
  openFile = () => {
    remote.dialog.showOpenDialog({
      title: 'Select Image',
      defaultPath: this.props.sampleImg,
      filters: [{
        name: 'Images',
        extensions: ['jpg', 'png']
      }]
    }, (filePaths) => {
      if (!filePaths) {
        return;
      }
      this.updateProperty('sampleImg', filePaths[0] || '');
    })
  }
  render() {
    const {
      name,
      cols, rows,
      anchorX, anchorY
    } = this.props.data;
    return (
      <div>
        <div className="header">
          Config Properties
        </div>
        <div className="settings">
          <div className="item">
            <label>Name</label>
            <input
              type="text"
              onChange={this.onChange}
              name="name"
              value={name}
            />
          </div>
          <div className="item">
            <label>Sample Image</label>
            <button onClick={this.openFile}>
              Select File
            </button>
          </div>
          <div className="item">
            <label>Columns</label>
            <input
              type="text"
              onChange={this.onChange}
              name="cols"
              value={cols}
            />
          </div>
          <div className="item">
            <label>Rows</label>
            <input
              type="text"
              onChange={this.onChange}
              name="rows"
              value={rows} />
          </div>
          <div className="item">
            <label>Anchor X</label>
            <input
              type="text"
              onChange={this.onChange}
              name="anchorX"
              value={anchorX} />
          </div>
          <div className="item">
            <label>Anchor Y</label>
            <input type="text"
              onChange={this.onChange}
              name="anchorY"
              value={anchorY} />
          </div>
        </div>
      </div>
    )
  }
}
