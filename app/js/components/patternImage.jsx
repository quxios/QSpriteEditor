import React from 'react'
import Manager from '../manager'

export default class PatternImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: ''
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.i === '') {
      return this.onSampleLoaded('');
    }
    Manager.getPatternClip(nextProps.i, this.onSampleLoaded);
  }
  componentDidMount() {
    if (this.props.i === '') {
      return this.onSampleLoaded('');
    }
    Manager.getPatternClip(this.props.i, this.onSampleLoaded);
  }
  onSampleLoaded = (src) => {
    this.setState({ src });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.i !== this.props.i ||
      nextState.src !== this.state.src;
  }
  render() {
    return <img src={this.state.src} />
  }
}
