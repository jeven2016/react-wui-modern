import React from 'react';
import useElement from '../common/useElement';

const DisabledStyle = {
  cursor: 'not-allowed',
  opacity: '.7',
};

const EnabledStyle = {
  cursor: 'pointer',
  color: '#007aff',
};

const Title = React.forwardRef((props, ref) => {
  const {directRef, ...otherProps} = props;
  return useElement({...otherProps}, ref, 'dropdown-title', null,
      props.disabled ? DisabledStyle : EnabledStyle);
});

export default Title;