import React from 'react'
import Manager from '../manager'
import { observer } from 'mobx-react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import PatternImage from './patternImage'

const SortableItem = SortableElement(({i, value, config, onContextMenu}) => {
  const onContextMenu2 = (e) => {
    if (onContextMenu) onContextMenu(e, i);
  }
  return (
    <li onContextMenu={onContextMenu2}>
      <PatternImage i={value} config={config} />
      <a>{value}</a>
    </li>
  )
});

const List = SortableContainer(observer(({items, config, onContextMenu}) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          i={index}
          value={value}
          config={config}
          onContextMenu={onContextMenu}
        />
      ))}
    </ul>
  );
}));

@observer
export default class ListPattern extends React.Component {
  onSortEnd = (data, e) => {
    Manager.movePattern(data);
  }
  onContextMenu = (e, i) => {
    const {
      clientX,
      clientY
    } = e.nativeEvent;
    Manager.openContext(clientX, clientY, 'pattern', i);
    e.stopPropagation();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.pose !== this.props.pose ||
      nextProps.config !== this.props.config;
  }
  render() {
    const {
      pose,
      config
    } = this.props;
    return (
      <List
        items={pose.pattern}
        cols={config.cols}
        rows={config.rows}
        sampleImg={config.sampleImg}
        onSortEnd={this.onSortEnd}
        onContextMenu={this.onContextMenu}
        distance={5}
        transitionDuration={200}
        axis="x"
        lockAxis="x"
        lockToContainerEdges={true}
        helperClass="sortHelperPattern"
      />
    )
  }
}
