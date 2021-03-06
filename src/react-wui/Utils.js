import React from 'react';
import {
  inRange,
  isBoolean,
  isInteger,
  isFunction,
  isNil,
  isObject,
  isString,
  random,
  slice,
  without,
} from 'lodash';

export {
  isNil,
  isObject,
  inRange,
  isInteger,
  isFunction,
  isString,
  isBoolean,
  random,
  slice,
  without,
};

export const isArray = (value) => {
  // return Object.prototype.toString.call(value) === "[object Array]";
  return Array.isArray(value);
};

export const isBlank = (value) => {
  return isNil(value) || /^\s*$/.test(value);
};

export const RadioGroupContext = React.createContext({});

/**
 * Set padding property for a child node instead of setting margin property
 * @param destComponent
 * @param ctrl
 * @param type
 * @param padding
 */
export const placePadding = (
    destComponent, ctrl, type, padding = '0px', margin = 0) => {
  switch (type) {
    case 'bottom':
    case 'bottomLeft':
    case 'bottomRight':
      destComponent.style.paddingTop = `${padding}`;
      break;
    case 'top':
    case 'topLeft':
    case 'topRight':
      destComponent.style.paddingBottom = `${padding}`;
      break;
    case 'left':
    case 'leftTop':
    case 'leftBottom':
      destComponent.style.paddingRight = `${padding}`;
      break;
    case 'right':
    case 'rightTop':
    case 'rightBottom':
      destComponent.style.paddingLeft = `${padding}`;
      break;
  }
  place(destComponent, ctrl, type, margin);
};

//todo: transform : left , right not working
export const setTransformOrigin = (destComponent, type) => {
  let origin = 'center';
  switch (type) {
    case 'bottom':
    case 'bottomLeft':
    case 'bottomRight':
      origin = 'top';
      break;
    case 'top':
    case 'topLeft':
    case 'topRight':
      origin = 'bottom';
      break;
    case 'left':
      origin = 'right center';
      break;
    case 'leftTop':
      origin = 'right bottom';
      break;
    case 'leftBottom':
      origin = 'right top';
      break;
    case 'right':
      origin = 'left center';
      break;
    case 'rightTop':
      origin = 'left bottom';
      break;
    case 'rightBottom':
      origin = 'left top';
      break;
  }

  destComponent.style.transformOrigin = origin;
};

/**
 * place a component to somewhere
 */
export const place = (dest, ctrl, type, offset = 0) => {
  var scrollTop = document.documentElement.scrollTop || window.pageYOffset
      || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft || window.pageXOffset
      || document.body.scrollLeft;

  var pos = ctrl.getBoundingClientRect();
  if (type === 'bottom') {
    dest.style.left = scrollLeft + (pos.left
        - (dest.offsetWidth
            - ctrl.offsetWidth)
        / 2) + 'px';
    dest.style.top = (pos.bottom + offset) + scrollTop + 'px';
  }

  if (type === 'top') {
    dest.style.left = scrollLeft + (pos.left
        - (dest.offsetWidth
            - ctrl.offsetWidth)
        / 2) + 'px';
    dest.style.top = (pos.top - dest.offsetHeight
        - offset)
        + scrollTop + 'px';
  }

  if (type === 'left') {
    dest.style.left = scrollLeft + pos.left - dest.offsetWidth
        - offset + 'px';
    dest.style.top = pos.top - (dest.offsetHeight
        - ctrl.offsetHeight) / 2
        + scrollTop
        + 'px';
  }

  if (type === 'leftTop') {
    dest.style.left = scrollLeft + pos.left - dest.offsetWidth
        - offset + 'px';
    dest.style.top = pos.top + scrollTop - dest.offsetHeight
        + pos.height + 'px';
  }

  if (type === 'leftBottom') {
    dest.style.left = scrollLeft + pos.left - dest.offsetWidth
        - offset + 'px';
    dest.style.top = pos.top + scrollTop + 'px';
  }

  if (type === 'right') {
    dest.style.left = scrollLeft + pos.right + offset + 'px';
    dest.style.top = pos.top - (dest.offsetHeight
        - ctrl.offsetHeight) / 2
        + scrollTop
        + 'px';
  }

  if (type === 'rightTop') {
    dest.style.left = scrollLeft + pos.right + offset + 'px';
    dest.style.top = pos.top + scrollTop - dest.offsetHeight
        + pos.height + 'px';
  }

  if (type === 'rightBottom') {
    dest.style.left = scrollLeft + pos.right + offset + 'px';
    dest.style.top = pos.top + scrollTop + 'px';
  }

  if (type === 'topLeft') {
    dest.style.left = scrollLeft + pos.left + 'px';
    dest.style.top = pos.top - dest.offsetHeight - offset
        + scrollTop
        + 'px';
  }

  if (type === 'topRight') {
    dest.style.left = scrollLeft + pos.right
        - dest.offsetWidth + 'px';
    dest.style.top = pos.top - dest.offsetHeight - offset
        + scrollTop
        + 'px';
  }

  if (type === 'bottomLeft') {
    dest.style.left = scrollLeft + pos.left + 'px';
    dest.style.top = pos.bottom + offset
        + scrollTop
        + 'px';
  }

  if (type === 'bottomRight') {
    dest.style.left = scrollLeft + pos.right
        - dest.offsetWidth + 'px';
    dest.style.top = pos.bottom + offset
        + scrollTop
        + 'px';
  }
};

export const placeCenter = (dest, ctrl) => {
  dest.style.left = getLeftIfCentered(dest, ctrl);
  dest.style.top = getTopIfCentered(dest, ctrl);
};

export const placeVerticalCenter = (dest, ctrl) => {
  const y = getTopIfCentered(dest, ctrl);
  dest.style.transform = `translateY(${y})`;
};

export const getLeftIfCentered = (dest, ctrl) => {
  var ctrlPos = ctrl.getBoundingClientRect();
  var destPos = dest.getBoundingClientRect();
  let destAvaliableWidth = Math.max(destPos.width,
      dest.offsetWidth);
  let x = Math.floor((ctrlPos.width - destAvaliableWidth) / 2) + 'px';
  return x;
};

export const getTopIfCentered = (dest, ctrl) => {
  var ctrlPos = ctrl.getBoundingClientRect();
  var destPos = dest.getBoundingClientRect();

  let destAvaliableHeight = Math.max(destPos.height,
      dest.offsetHeight);

  let y = Math.floor(
      (ctrlPos.height - destAvaliableHeight) / 2) + 'px';
  return y;
};

export const validate = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const createContainer = (id) => {
  if (isNil(id)) {
    id = `wui-container-${random(100, 10000)}`;
  }
  let root = document.querySelector(`#${id}`);

  if (!root) {
    root = document.createElement('div');
    root.id = id;
    document.body.insertBefore(root, document.body.lastElementChild);
  }

  const remove = () => {
    root.remove();
  };

  return {
    container: root,
    id: id,
    remove: remove,
  };
};

export const execute = (handler, timeout) => {
  const timer = setTimeout(() => {
    handler();
    clearTimeout(timer);
  }, timeout);
  return timer;
};

export const invoke = (callback, ...args) => {
  return !isNil(callback) && (callback)(args);
};
