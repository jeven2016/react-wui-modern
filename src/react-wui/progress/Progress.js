import React from 'react';
import clsx from 'clsx';
import {isNil} from '../Utils';
import Loader from '../Loader';

const ProgressType = {
  info: 'info',
  ok: 'ok',
  warning: 'warning',
  error: 'error',
};

const Progress = React.forwardRef((props, ref) => {
  const {
    active = true,
    className = 'progress', extraClassName,
    percentValue, type = 'info',
    hasStripe, hasAnimation, top, showDetail, showLoading = false,
    style,
    ...otherProps
  } = props;
  const clsName = clsx(extraClassName, className, {
    [ProgressType[type]]: ProgressType[type],
    'with-stripe': hasStripe,
    'animation': hasAnimation,
    'without-info': !showDetail,
    top: top,
  });

  const newStyle = {...style, opacity: active ? '1' : '0'};

  const infoContent = `${percentValue}%`;
  return <div ref={ref} className={clsName} style={newStyle} {...otherProps}>
    <div className="bar">
      <div className="bg" style={{width: infoContent}}/>
    </div>
    {
      showDetail ? <div className="info">
            {infoContent}
          </div>
          : null
    }

    {top && showLoading ? <Loader type="secondary" size="small"/> : null}

  </div>;
});

export default Progress;