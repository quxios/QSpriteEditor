import React from 'react'
import Manager from '../manager'

import { ListPose } from './listToolbar'

export default class PoseList extends React.Component {
  addNew = (e) => {
    Manager.addPose();
    e.stopPropagation();
  }
  delete = (e) => {
    Manager.deletePose(this.props.currentPose)
    e.stopPropagation();
  }
  delButton() {
    return (
      <button onClick={this.delete}>
        <i className="fa fa-minus" aria-hidden />
        Delete
      </button>
    )
  }
  body() {
    const style = {
      height: '100%'
    }
    const {
      pose,
      currentPose,
      selectedContext
    } = this.props;
    const poses = pose.poses;
    return (
      <div style={style}>
        <div className="header">
          Poses
        </div>
        <ListPose
          items={poses}
          selected={currentPose}
          selectedContext={selectedContext}
        />
        <div className="footer">
          <button onClick={this.addNew}>
            <i className="fa fa-plus" aria-hidden />
            New
          </button>
          { currentPose !== -1 && this.delButton() }
        </div>
      </div>
    )
  }
  render() {
    const { config } = this.props;
    const style = {
      left: config ? 175 : 0
    }
    return (
      <div className="toolbar list" style={style}>
        { config && this.body() }
      </div>
    )
  }
}
