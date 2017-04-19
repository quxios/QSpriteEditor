import React from 'react'
import Manager from '../manager'
import { observer } from 'mobx-react'

import ConfigJSON from './../manager/JSONConfig'
import List from './listPattern'

@observer
export default class PatternList extends React.Component {
  body(pose, config) {
    return <List pose={pose} config={config} />
  }
  render() {
    const {
      config,
      pose
    } = this.props;
    const style = {
      bottom: pose ? 0 : -175
    }
    return (
      <div className="toolbar pattern" style={style}>
        { pose && this.body(pose, config) }
      </div>
    )
  }
}
