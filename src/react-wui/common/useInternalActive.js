import React, {useState} from 'react';
import {isNil} from '../Utils';
import {Active} from './Constants';

/**
 * Use internal active state
 * 1. the defaultActive is set and autoChange is true, the component
 *     will initially display defaultActive state but can internally change to other state
 * 2. the defaultActive is set but autoChange is always false,
 *     the active state can only be changed along with defaultActive (usually controlled by outside).
 * @param defaultActive
 */
const useInternalActive = (defaultActive, autoChange) => {
  const [internalActive, setInternalActive] = useState(Active.na);
  const isControlledByOther = () => !isNil(defaultActive);

  const getCurrent = () => {
    if (!isControlledByOther()) {
      return Active.isNa(internalActive) ? defaultActive : internalActive;
    }
    if (autoChange && !Active.isNa(internalActive)) {
      return internalActive;
    }
    return Active.convertBool(defaultActive);
  };

  const isActive = (value) => {
    if (!isNil(value)) {
      return Active.isActive(value);
    }
    return Active.isActive(getCurrent());
  };

  return {
    isActive: isActive,
    getActive: () => internalActive,
    setActive: setInternalActive,
  };
};

export default useInternalActive;