import React from 'react';
import clsx from 'clsx';

const Slider = React.forwardRef((props, ref) => {
  const {
    className = 'layout-slider',
    hasBox = false,
    extraClassName,
    collapse = false,
    ...otherProps
  } = props;
  let clsName = clsx(extraClassName, className, {
    'with-box': hasBox,
    'collapsed': collapse,
  });

  return <div className={clsName} {...otherProps}/>;
});

export default Slider;