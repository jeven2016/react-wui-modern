import React from 'react';
import {isNil} from '../Utils';
import useInternalActive from '../common/useInternalActive';
import clsx from 'clsx';
import {Active} from '../common/Constants';

const TransparentbtnStyle = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
};

const Toggle = React.forwardRef((props, ref) => {
  const {
    active = false, disabled = false, className = 'toggle', extraClassName,
    children, type = 'normal', content, onChange, ...otherProps
  } = props;

  const internalObj = useInternalActive(active, !disabled);
  const isActive = internalObj.isActive;
  const setActive = internalObj.setActive;

  let isOn = isActive();
  let clsName = clsx(extraClassName, className, {
    on: isOn,
    off: !isOn,
    disabled: disabled,
    [type]: type,
  });

  const getContent = (isBarContent) => {
    if (isNil(content)) {
      return null;
    }

    if ((isBarContent && !content.showInBar)) {
      return null;
    }

    if (!isBarContent && content.showInBar) {
      return null;
    }

    return isActive() ? content.on : content.off;
  };

  const clickToggle = (e) => {
    if (disabled) {
      return;
    }
    const activeState = !isActive();
    const newActive = Active.convertBool(activeState);
    setActive(newActive);
    !isNil(onChange) && onChange(activeState, e);
  };

  return <button style={TransparentbtnStyle}
                 ref={ref}
                 disabled={disabled}
                 onClick={clickToggle} {...otherProps}>
      <span className={clsName}>
        <span className="bar">
         {getContent(true)}
        </span>
        <span className="ball">
          {getContent(false)}
        </span>
      </span>
  </button>;

});

export default Toggle;