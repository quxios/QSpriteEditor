import React from 'react'
import Manager from '../manager'
import { observer } from 'mobx-react'

import ConfigList from './toolbarConfigList'
import PoseList from './toolbarPoseList'
import Properties from './toolbarProperties'
import PatternList from './toolbarPatternList'
import ContextMenu from './contextMenu'

@observer
export default class Toolbar extends React.Component {
  render() {
    const {
      configs,
      currentConfig,
      currentPose,
      context,
      config,
      pose
    } = this.props.store;
    return (
      <div>
        <PoseList
          config={config}
          pose={config}
          currentPose={currentPose}
          selectedContext={context.type === 'pose' ? context.selected : -1}
        />
        <ConfigList
          configs={configs}
          currentConfig={currentConfig}
          selectedContext={context.type === 'config' ? context.selected : -1}
        />
        <Properties
          config={config}
          pose={pose}
        />
        <PatternList
          config={config}
          pose={pose}
          selectedContext={context.type === 'pattern' ? context.selected : -1}
        />
        <ContextMenu context={context} />
      </div>
    )
  }
}
