import React, {useState} from 'react';

/**
 * Use internal active state
 * 1. the defaultActive is set, the component
 *     will initially display defaultActive state but can internally change to other state
 * 2. the active is set,
 *     the active state cannot be changed automatically usually because it is controlled by outside.
 */
const useInternalActive = (isExternalControl, defaultActive, active) => {
  const initActive = isExternalControl ? active : defaultActive;
  const [internalActive, setInternalActive] = useState(initActive);
  return {
    isActive: isExternalControl ? active : internalActive,
    setActive: setInternalActive,
  };
};

export default useInternalActive;