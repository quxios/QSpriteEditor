import React from 'react'
import Manager from '../manager'
import { observer } from 'mobx-react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({value, i, onClick, onContextMenu, isSelected, isContextSelected}) => {
  const onClick2 = (e) => {
    if (onClick) onClick(e, i);
  }
  const onContextMenu2 = (e) => {
    if (onContextMenu) onContextMenu(e, i);
  }
  let cls = isSelected ? 'selected' : '';
  if (isContextSelected) cls += ' contextSelected';
  return (
    <li className={cls} onClick={onClick2} onContextMenu={onContextMenu2}>
      <i className="handle" aria-hidden />
      <a>{value}</a>
    </li>
  )
});

const List = SortableContainer(observer(({items, onClick, onContextMenu, selected, selectedContext}) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem
          key={`item-${index}`}
          index={index}
          i={index}
          value={value.name}
          onClick={onClick}
          onContextMenu={onContextMenu}
          isSelected={selected === index}
          isContextSelected={selectedContext === index}
        />
      ))}
    </ul>
  );
}));

@observer
export class ListConfig extends React.Component {
  onSortStart = (data, e) => {
    Manager.selectConfig(data.index);
  }
  onSortEnd = (data, e) => {
    Manager.moveConfig(data);
    Manager.selectConfig(data.newIndex);
  }
  onClick = (e, i) => {
    Manager.selectConfig(i, true);
    e.stopPropagation();
  }
  onContextMenu = (e, i) => {
    const {
      clientX,
      clientY
    } = e.nativeEvent;
    Manager.openContext(clientX, clientY, 'config', i);
    e.stopPropagation();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.items !== this.props.items ||
      nextProps.selected !== this.props.selected ||
      nextProps.selectedContext !== this.props.selectedContext
  }
  render() {
    return (
      <List
        items={this.props.items}
        selected={this.props.selected}
        selectedContext={this.props.selectedContext}
        onSortEnd={this.onSortEnd}
        onSortStart={this.onSortStart}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        distance={5}
        transitionDuration={200}
        lockAxis="y"
        lockToContainerEdges
        helperClass="sortHelperList"
      />
    )
  }
}

@observer
export class ListPose extends React.Component {
  onSortStart = (data, e) => {
    Manager.selectPose(data.index);
  }
  onSortEnd = (data, e) => {
    Manager.movePose(data);
    Manager.selectPose(data.newIndex);
  }
  onClick = (e, i) => {
    Manager.selectPose(i, true);
    e.stopPropagation();
  }
  onContextMenu = (e, i) => {
    const {
      clientX,
      clientY
    } = e.nativeEvent;
    Manager.openContext(clientX, clientY, 'pose', i);
    e.stopPropagation();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.items !== this.props.items ||
      nextProps.selected !== this.props.selected ||
      nextProps.selectedContext !== this.props.selectedContext
  }
  render() {
    return (
      <List
        items={this.props.items}
        selected={this.props.selected}
        selectedContext={this.props.selectedContext}
        onSortEnd={this.onSortEnd}
        onSortStart={this.onSortStart}
        onClick={this.onClick}
        onContextMenu={this.onContextMenu}
        distance={5}
        transitionDuration={200}
        lockAxis="y"
        lockToContainerEdges
        helperClass="sortHelperList"
      />
    )
  }
}
