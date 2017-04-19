import React from 'react'
import { observer } from 'mobx-react'

import Menubar from './menubar'
import Toolbar from './toolbar'
import Canvas from './canvas'
import Notifications from './notifications'

@observer
export default class Layout extends React.Component {
  render() {
    const {
      isLoaded,
      projectPath,
      currentConfig,
      notifications
    } = this.props.store;
    return (
      <div>
        <Notifications notifications={notifications} />
        <Menubar
          isLoaded={isLoaded}
          projectPath={projectPath}
        />
        { isLoaded && <Toolbar store={this.props.store} /> }
        <Canvas currentConfig={currentConfig} />
      </div>
    )
  }
}
