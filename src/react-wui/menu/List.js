import React from 'react';
import clsx from 'clsx';
import {isNil} from '../Utils';
import {JustifyContentType} from '../common/Constants';

/**
 * Menu List
 */
const List = React.forwardRef((props, ref) => {
  const {className, extraClassName, children, justify, ...otherProps} = props;
  let clsName = clsx(extraClassName, className);

  if (!isNil(justify)) {
    clsName = clsx(clsName, JustifyContentType[justify]);
  }

  return <ul className={clsName} ref={ref} {...otherProps}>
    {children}
  </ul>;
});

List.defaultProps = {
  className: 'menu-list',
};
export default List;