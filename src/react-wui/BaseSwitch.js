import React, {useState} from 'react';
import clsx from 'clsx';
import {isNil} from './Utils';
import Element from './common/Element';
import {preventEvent} from './event';

function BaseSwitch(props) {
  const {
    value, label, baseClassName, inputType, underControlled = false,
    iconChecked, iconUnchecked, canUnchecked = true, disabled = false,
    children, onChange, checked, ...otherProps
  } = props;
  const [checkState, setCheckState] = useState(false);
  const [manuallyChanged, setManuallyChanged] = useState(false);

  //update checked state
  let currentCheckState = checked;

  //if this switch is under controlled by other component, ignore it
  if (!underControlled && manuallyChanged) {
    currentCheckState = checkState;
  }

  //get the icon
  const Icon = currentCheckState ? iconChecked : iconUnchecked;

  let clsName = clsx(baseClassName, {
    checked: currentCheckState,
    unchecked: !currentCheckState,
  });

  const onClick = (evt) => {
    if (currentCheckState && !canUnchecked) {
      console.log('return');
      return;
    }

    if (!manuallyChanged) {
      setManuallyChanged(true);
    }

    let state = !currentCheckState;
    setCheckState(state);
    !isNil(onChange) && onChange(!isNil(value) ? value : state, evt);
  };

  return <>
    <Element className={clsName} disabled={disabled}
             onClick={onClick} {...otherProps}>
      <input type={inputType} value={value} className="hidden-input"/>
      <Icon/>
      <span className="label">
        {label}
        {children}
        </span>
    </Element>
  </>;
}

export default BaseSwitch;
;