import React from 'react'
import Manager from '../manager'

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      speed: 15,
      adjust: false,
      pattern: ""
    }
    this.updatePose = ::this.updatePose;
  }
  componentWillMount() {
    Manager.on('UPDATE_POSE', this.updatePose);
    Manager.emit('UPDATE_POSE', Manager.getCurrentPose());
  }
  componentWillUnmount() {
    Manager.remove('UPDATE_POSE', this.updatePose);
  }
  updatePose(pose) {
    this.setState(pose)
  }
  onNameChange(e) {
    let name = e.target.value;
    this.setState({ name });
    e.target.classList.remove('error');
  }
  submitName(e) {
    let name = e.target.value;
    e.target.classList.remove('error');
    if (!Manager.changePoseName(name)) {
      e.target.classList.add('error');
    }
  }
  onSpeedChange(e) {
    let speed = e.target.value;
    if (/^[0-9.-]*$/.test(speed)) {
      this.setState({ speed });
      Manager.changePoseSpeed(speed);
    }
    e.target.classList.remove('error');
  }
  submitSpeed(e) {
    let speed = e.target.value;
    e.target.classList.remove('error');
    if (!Manager.changePoseSpeed(speed, true)) {
      e.target.classList.add('error');
    }
  }
  onAdjustChange(e) {
    Manager.changePoseAdjust(e.target.checked);
  }
  onPatternChange(e) {
    let pattern = e.target.value;
    if (/^[0-9,-]*$/.test(pattern)) {
      this.setState({ pattern })
      Manager.changePosePattern(pattern);
    }
    e.target.classList.remove('error');
  }
  submitPattern(e) {
    let pattern = e.target.value;
    e.target.classList.remove('error');
    if (!Manager.changePosePattern(pattern, true)) {
      e.target.classList.add('error');
    }
  }
  checkEnter(e) {
    if (e.keyCode === 13) {
      e.target.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }
  render() {
    const { name, speed, adjust, pattern } = this.state;
    const style = {
      height: this.props.height
    }
    return (
      <div className='settings' style={style}>
        <div className='item'>
          <label>Name</label>
          <input type='text'
            onChange={::this.onNameChange}
            onKeyDown={::this.checkEnter}
            onBlur={::this.submitName}
            value={name} />
        </div>
        <div className='item'>
          <label>Speed</label>
          <input type='text'
            onChange={::this.onSpeedChange}
            onKeyDown={::this.checkEnter}
            onBlur={::this.submitSpeed}
            value={speed} />
        </div>
        <div className='item'>
          <label>Adjust</label>
          <input
            type='checkbox'
            onChange={::this.onAdjustChange}
          />
        </div>
        <div className='item'>
          <label>Pattern</label>
          <input type='text'
            onChange={::this.onPatternChange}
            onKeyDown={::this.checkEnter}
            onBlur={::this.submitPattern}
            value={pattern}
             />
        </div>
      </div>
    )
  }
}
