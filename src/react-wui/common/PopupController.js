import React, {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import {Active, EventListener, PopupCtrlType} from './Constants';
import useEvent from './UseEvent';
import {execute, isNil, placePadding, setTransformOrigin} from '../Utils';
import * as ReactDOM from 'react-dom';
import {CSSTransition} from 'react-transition-group';
import useContainer from './useContainer';
import Button from '../button';

const useCombinedListeners = (
    element, enterHandler, leaveHandler, dependencies) => {
  useEvent(EventListener.mouseEnter,
      useCallback(enterHandler, dependencies),
      true, element);
  useEvent(EventListener.mouseLeave,
      useCallback(leaveHandler, dependencies),
      true, element);
  useEvent(EventListener.focus,
      useCallback(enterHandler, dependencies),
      true, element);
  useEvent(EventListener.blur,
      useCallback(leaveHandler, dependencies),
      true, element);
};

const PopupController = React.forwardRef((props, ref) => {
  const [pcState, setPcState] = useState({activePopup: Active.na});
  const {
    onHover,
    disabled = false,
    setChildDisabled = true,// whether to copy disabled for child node( ctrl )
    position = 'bottomLeft',
    defaultActive,

    active,  //maintain the active state outside, do not change it automatically
    onChange, //a callback used to set the active state

    autoClose = true, //deprecated: auto close the content even though the defaultActive is true
    onAutoClose, // deprecated: the callback would be invoked while clicking document and trying to close the popup, true : the popup will be closed

    triggerBy = PopupCtrlType.click,
    bodyOffset = '0.3rem',
    onOpen,
    onClose,
    closeDelay = 100,  //delay some times to close the popup
    margin = 0, //the popup margin value in px, to set the gap between the popup and ctrl
    handleChildren = () => {},
    children,
    ...otherProps
  } = props;
  const rootElem = useContainer('wui-portals');
  const ctrlRef = useRef(null);
  const bodyRef = useRef(null);

  const hasDefaultValue = !isNil(defaultActive);
  const isControlledByOutside= !isNil(active) || !isNil(onChange);//TODO

  const isControlledByOther = () => !isNil(defaultActive);//deprecated
  const canNotTrigger = isControlledByOther() && !autoClose;

  //a flag
  const closingRef = useRef(false);

  /**
   * Expose a close method to parent node inorder to close the popup outside this
   * component.
   */
  useImperativeHandle(ref, () => ({
    close: () => closePopup(),
  }));

  const closePopup = () => setPcState(
      {...pcState, activePopup: Active.disactive});

  //add listener for document click event
  useEvent(EventListener.click, (e) => {
    // if the active state is maintained by outside and cannot be closed internally
    if (canNotTrigger) {
      return;
    }
    if (disabled || !isActive()) {
      return;
    }

    const isClickPopup = bodyRef.current.contains(e.target);
    const isClickCtrl = ctrlRef.current.contains(e.target);

    if (!isClickPopup && !isClickCtrl) {
      closePopup();
      handleCallback(false);
      return;
    }

    if (onAutoClose && onAutoClose(isClickPopup, isClickCtrl)) {
      closePopup();
      handleCallback(false);
    }
  });

  useEvent(EventListener.resize, (e) => {
    move();
  }, true, window);

  const getCurrent = () => {
    if (!isControlledByOther()) {
      const interActive = pcState.activePopup;
      return Active.isNa(interActive) ? defaultActive : interActive;
    }
    if (autoClose && !Active.isNa(pcState.activePopup)) {
      return pcState.activePopup;
    }
    return Active.convertBool(defaultActive);
  };

  const isActive = (value) => {
    if (!isNil(value)) {
      return Active.isActive(value);
    }
    return Active.isActive(getCurrent());
  };

  const move = () => {
    if (!disabled && isActive()) {
      const contentDomNode = bodyRef.current;
      setTransformOrigin(contentDomNode, position);
      placePadding(contentDomNode, ctrlRef.current, position, bodyOffset,
          margin);
    }
  };

  useLayoutEffect(() => {
    move();
  });

  const handleHover = (e, nextActiveState) => {
    if (disabled || canNotTrigger || !PopupCtrlType.isHover(triggerBy)) {
      return;
    }

    const changeStatus = () => {
      setPcState({
        ...pcState,
        activePopup: nextActiveState,
      });

      handleCallback(nextActiveState);
    };

    //to active
    if (Active.isActive(nextActiveState)) {
      if (closingRef.current) {
        closingRef.current = false;
      }

      //if the popup hasn't been activated
      if (!Active.isActive()) {
        changeStatus();
        return;
      }
    }

    //for de-active, trying to close in some mill-seconds later while no other
    //timer(s) is running
    if (!Active.isActive(nextActiveState)) {
      closingRef.current = true;
      execute(() => {
        if (closingRef.current) {
          closingRef.current = false;
          changeStatus();
        }
      }, closeDelay);
    }

  };

  const getPopupBody = (popupBody, bdClsName) => {
    if (disabled) {
      return null;
    }
    const cls = clsx(bdClsName, 'popup');
    const popupBodyElem = <CSSTransition
        in={isActive()} //why cannot directly set true here? no '-enter' class is appended, a workround is set appear to true
        timeout={200}
        appear={true}
        classNames="popup">
      <div className={cls} ref={bodyRef}>
        {popupBody}
      </div>
    </CSSTransition>;

    return ReactDOM.createPortal(popupBodyElem, rootElem);
  };

  const clickCtrl = (e) => {
    if (PopupCtrlType.isHover(triggerBy) || canNotTrigger ||
        isActive()) {
      return;
    }
    let status = getOppositeStatus(pcState.active);
    setPcState({
      ...pcState,
      activePopup: status,
    });

    handleCallback(status);
  };

  const handleCallback = (value) => {
    if (onOpen && isActive(value)) {
      onOpen();
    }
    if (onClose && !isActive(value)) {
      onClose();
    }
  };

  const getOppositeStatus = (status) => {
    if (Active.isNa(status)) {
      return Active.active;
    }
    return Active.isActive(status)
        ? Active.disactive
        : Active.active;
  };

  const {ctrl, body, bodyClassName} = handleChildren(children);
  const popupBody = getPopupBody(body, bodyClassName);

  const getPopupCtrl = () => {
    const childProp = {};
    if (setChildDisabled) {
      childProp.disabled = disabled;
    }
    if (ctrl.type === Button) {
      childProp.directRef = ctrlRef; //Button supports multiple refs
    } else {
      childProp.ref = ctrlRef;
    }
    let ctrlProps = {
      ...childProp, disabled: disabled,
    };

    return React.cloneElement(ctrl, ctrlProps);
  };

  //add listeners for controller
  const ctrlElem = useCallback(() => ctrlRef.current, [triggerBy]);
  useEvent(EventListener.click, useCallback(clickCtrl, [triggerBy]),
      true, ctrlElem);
  useCombinedListeners(ctrlElem, (e) => handleHover(e, Active.active),
      (e) => handleHover(e, Active.disactive), [triggerBy]);

  //add listeners for body
  const bodyElem = useCallback(() => bodyRef.current, [triggerBy]);
  useCombinedListeners(bodyElem, (e) => handleHover(e, Active.active),
      (e) => handleHover(e, Active.disactive), [triggerBy]);

  return <>
    {getPopupCtrl()}
    {popupBody}
  </>;

});

export default PopupController;