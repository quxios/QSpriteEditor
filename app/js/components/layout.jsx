import React from 'react'
import Menubar from './menubar'
import Toolbar from './toolbar'
import Canvas from './canvas'

export default class extends React.Component {
  render() {
    return (
      <div>
        <Menubar />
        <Toolbar />
        <Canvas />
      </div>
    )
  }
}
