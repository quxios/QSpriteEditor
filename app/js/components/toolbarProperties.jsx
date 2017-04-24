import React from 'react'
import Manager from '../manager'

import ConfigProperties from './propertiesConfig'
import PoseProperties from './propertiesPose'

export default class ToolbarProperties extends React.Component {
  render() {
    const {
      config,
      pose
    } = this.props;
    const style = {
      right: config ? 0 : -225
    }
    return (
      <div className="toolbar props" style={style}>
        <div className="container">
          { config && <ConfigProperties data={config} /> }
          { pose && <PoseProperties data={pose} /> }
        </div>
      </div>
    )
  }
}
