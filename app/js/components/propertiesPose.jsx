import React from 'react'
import { observer } from 'mobx-react'

@observer
export default class PoseProperties extends React.Component {
  updateProperty(key, value) {
    this.props.data[key] = value;
  }
  onChange = (e) => {
    const prop = e.target.name;
    let value = e.target.value;
    if (prop === 'speed') {
      if (!/^\d*$/.test(value)) {
        return; // invalid
      }
      value = Number(value);
    }
    if (prop === 'adjust') {
      value = e.target.checked;
    }
    if (prop === 'pattern') {
      if (!/^[0-9,]*$/.test(value)) {
        return; // invalid
      }
      value = value.split(',').map((v) => {
        return /[0-9]/.test(v) ? Number(v) : ''
      })
      while (value[0] === '') {
        value.shift();
      }
    }
    this.updateProperty(prop, value);
  }
  render() {
    const {
      name,
      speed,
      adjust,
      pattern
    } = this.props.data;
    const patternStr = pattern.join(',');
    return (
      <div>
        <div className="header">
          Pose Properties
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
            <label>Speed</label>
            <input
              type="text"
              onChange={this.onChange}
              name="speed"
              value={speed}
            />
          </div>
          <div className="item">
            <label>Adjust</label>
            <input
              type="checkbox"
              onChange={this.onChange}
              name="adjust"
              checked={adjust}
            />
          </div>
          <div className="item">
            <label>Pattern</label>
            <input
              type="text"
              onChange={this.onChange}
              name="pattern"
              value={patternStr}
            />
          </div>
        </div>
      </div>
    )
  }
}
