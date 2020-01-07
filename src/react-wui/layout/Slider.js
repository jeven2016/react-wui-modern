import React from 'react';
import clsx from 'clsx';
import {Spring} from 'react-spring/renderprops';

const Slider = React.forwardRef((props, ref) => {
  const {
    className = 'layout-slider',
    hasBox = false,
    extraClassName,
    collapse = false,
    width = '250px',
    style = {},
    ...otherProps
  } = props;
  let clsName = clsx(extraClassName, className, {
    'with-box': hasBox,
    // 'collapsed': collapse,
  });
  console.log(`colla=${collapse}`);
  return <Spring
      from={{
        width: collapse ? width : '80px',
      }}
      to={{
        width: collapse ? '80px' : width,
      }}>
    {
      springProps => {
        const newProps = {...style, ...springProps};
        return <div className={clsName} style={newProps} {...otherProps}/>;
      }
    }
  </Spring>;
});

export default Slider;