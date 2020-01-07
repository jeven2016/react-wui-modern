import React, {useRef, useEffect} from 'react';

const useMount = () => {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);
  return mountedRef;
};

export default useMount;