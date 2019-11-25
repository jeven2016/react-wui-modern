import React, {Component} from 'react';
import shallowEqual from 'shallowequal';
import {
  addWindowEventListener,
  removeWindowEventListener,
} from './EventFuntions';

export default class WindowEventHandler extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  componentDidMount() {
    this.attachEvent();
  }

  componentWillUpdate() {
    this.detachEvent();
  }

  componentDidUpdate() {
    this.attachEvent();
  }

  componentWillUnmount() {
    this.detachEvent();
  }

  //https://developer.mozilla.org/en-US/docs/Web/Events
  //<WindowEventHandler onXX={XX}/>
  render() {
    return null;
  }

  detachEvent() {
    this.execute(
        (property, fun) => removeWindowEventListener(property.toLocaleString(),
            fun));
  }

  attachEvent() {
    this.execute(
        (property, fun) => addWindowEventListener(property.toLocaleString(),
            fun));
  }

  execute(callback) {
    let props = this.props;

    Object.keys(props).
        filter(property => property.startsWith('on')).
        forEach(property => {
          let eventType = property.toLowerCase().replace('on', '');
          callback(eventType, props[property]);
        });
  }
}