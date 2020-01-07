import React, {useRef, useEffect} from 'react';

/**
 * Creates DOM element to be used as React root.
 */
export function useCreateRootElement(id) {
  const rootRef = useRef(null);
  if (!rootRef.current) {
    let rootElem = document.querySelector(`#${id}`);
    if (!rootElem) {
      rootElem = document.createElement('div');
      rootElem.setAttribute('id', id);
      document.body.insertBefore(
          rootElem,
          document.body.lastElementChild,
      );
    }
    rootRef.current = rootElem;
  }
  return rootRef;
}

function useContainer(id) {
  const rootElemRef = useCreateRootElement(id);
  const current = rootElemRef.current;
  useEffect(() => {
    return () => {
      //remove this node while this node is the last one to remove
      if (current && current.childNodes.length <= 0) {
        rootElemRef.current = null;
        current.remove();
      }
    };
  }, []);

  return current;
}

export default useContainer;