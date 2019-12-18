import React, {
  useCallback,
  useImperativeHandle,
  useEffect,
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
import {preventEvent} from '../event';

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

/**
 * @ref  => reference to React Component instead of a real dom node
 */
const PopupController = React.forwardRef((props, ref) => {
  const [pcState, setPcState] = useState({activePopup: Active.na});
  const {
    id,
    disabled = false,
    setChildDisabled = true,// whether to copy disabled for child node( ctrl )
    position = 'bottomLeft',
    defaultActive = false,

    active,  //maintain the active state outside, won't change it automatically
    onActiveChange, //a callback used to set the active state
    fireBackgroundClickEvent = true, //whether to fire the close event while clicking the background (document) .
    onAutoClose, //for internal use: the callback would be invoked while clicking document that trying to close the popup, true : the popup will be closed

    triggerBy = PopupCtrlType.click,
    bodyOffset = '0.3rem',
    defaultTransformOrigin,
    onOpen,
    onClose,
    onFocus,  //callback
    onBlur,
    onMouseEnter,
    onMouseLeave,
    closeDelay = 100,  //delay some times to close the popup
    margin = 0, //the popup margin value in px, to set the gap between the popup and ctrl
    handleChildren = () => {},
    children,
    controllerRef,
    popupRef,
    popupStyle,
    ...otherProps
  } = props;
  const rootElem = useContainer('wui-portals');
  const ctrlRef = controllerRef ? controllerRef : useRef(null);
  const bodyRef = popupRef ? popupRef : useRef(null);
  const isControlledByOutside = !isNil(active);

  //a flag
  const closingRef = useRef(false);

  const changeActive = (nextActive) => {
    //active state changed by internal logic instead of the outside component
    setPcState({
      ...pcState,
      activePopup: nextActive,
    });

    onActiveChange && onActiveChange(nextActive);

    if (Active.isActive(nextActive)) {
      onOpen && onOpen();
    }

    if (!Active.isActive(nextActive)) {
      onClose && onClose();
    }
  };
  const isHover = PopupCtrlType.isHover(triggerBy);

  /**
   * Expose a close method to parent node inorder to close the popup outside this
   * component.
   */
  useImperativeHandle(ref, () => ({
    close: () => changeActive(Active.disactive),
    show: () => changeActive(Active.active),
    blur: (e) => handleHover(e, Active.disactive, EventListener.blur),
  }));

  //add listener for document click event
  useEvent(EventListener.click, (e) => {

    if (disabled || !fireBackgroundClickEvent || !isActive()) {
      return;
    }
    const isClickPopup = bodyRef.current.contains(e.target);
    const isClickCtrl = ctrlRef.current.contains(e.target);

    if (isControlledByOutside) {
      onActiveChange && onActiveChange(false, {
        isClickCtrl: isClickCtrl,
        isClickPopup: isClickPopup,
        isClickDocument: !isClickCtrl && !isClickPopup,
      });
      return;
    }

    if (!isClickPopup && !isClickCtrl) {
      changeActive(Active.disactive);
      return;
    }

    if (onAutoClose && onAutoClose(isClickPopup, isClickCtrl)) {
      changeActive(Active.disactive);
    }
  });

  useEvent(EventListener.resize, (e) => {
    move();
  }, true, window);

  const getCurrentBoolValue = () => {
    if (!isControlledByOutside) {
      const interActive = pcState.activePopup;
      return Active.isNa(interActive) ? defaultActive : Active.isActive(
          interActive);
    }
    return Active.isNa(active)
        ? defaultActive
        : active;
  };

  const isActive = (value) => {
    if (!isNil(value)) {
      return Active.isActive(value);
    }
    return getCurrentBoolValue();
  };

  const move = () => {
    if (!disabled && isActive()) {
      const contentDomNode = bodyRef.current;
      if (isNil(defaultTransformOrigin)) {
        setTransformOrigin(contentDomNode, position);
      }
      placePadding(contentDomNode, ctrlRef.current, position, bodyOffset,
          margin);
    }
  };

  useEffect(() => {
    move();
  });

  const handleHover = (e, nextActiveState, eventType) => {
    if (disabled || !isHover) {
      return;
    }
    //the hover event should only be fired by controller or popup
    //the menu items or popover-arrow cannot trigger closing the popup
    const isFiredByCtrlOrPoupBody = e && (bodyRef.current === e.target
        || ctrlRef.current === e.target);

    const isFiredByOwner = ownerRef ? ownerRef.current === e.target : false;

    const isFiredByArrow = e && e.target.className &&
        e.target.className.includes('popover-arrow');

    if ((!isFiredByCtrlOrPoupBody && !isFiredByOwner) || isFiredByArrow) {
      return;
    }

    console.log('state changed=', eventType, e.target);
    if (!isNil(eventType)) {
      switch (eventType) {
        case EventListener.blur:
          onBlur && onBlur(e);
          break;
        case EventListener.focus:
          onFocus && onFocus(e);
          break;

        case EventListener.mouseEnter:
          onMouseEnter && onMouseEnter(e);
          break;
        case EventListener.mouseLeave:
          onMouseLeave && onMouseLeave(e);
      }
    }

    //to active
    if (Active.isActive(nextActiveState)) {
      if (closingRef.current) {

        closingRef.current = false;
      }

      if (isActive()) {
        //if current state is active, ignore
        return;
      }

      //if the popup hasn't been activated
      if (!Active.isActive()) {
        changeActive(nextActiveState);
        return;
      }
    }

    //for de-active, trying to close in some mill-seconds later while no other
    //timer(s) is running
    if (!Active.isActive(nextActiveState)) {
      closingRef.current = true;
      execute(() => {
        if (closingRef.current) { //todo: why its value is false??
          closingRef.current = false;
          changeActive(nextActiveState);
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
      <div className={cls} ref={bodyRef} style={popupStyle}>
        {popupBody}
      </div>
    </CSSTransition>;

    return ReactDOM.createPortal(popupBodyElem, rootElem);
  };

  const handleClick = (e) => {
    if (isHover || isActive()) {
      return;
    }
    if (isControlledByOutside) {
      onActiveChange(true, {
        isClickCtrl: true,
        isClickPopup: false,
        isClickDocument: false,
      });
      preventEvent(e);
    } else {
      const status = getOppositeStatus(pcState.activePopup);
      changeActive(status);

    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      //press the enter key
      handleClick(e);
    }
    if (e.keyCode === 27) {
      //press the esc key
      changeActive(Active.disactive);
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

  const {ctrl, body, bodyClassName, ownerRef} = handleChildren(children);
  const realPopupBody = getPopupBody(body, bodyClassName);

  const getPopupCtrl = useCallback(() => {
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
      ...childProp, ...otherProps, disabled: disabled,
    };

    return React.cloneElement(ctrl, ctrlProps);
  }, [disabled, otherProps]);

  //add listeners for controller
  const ctrlElem = useCallback(() => ownerRef && ownerRef.current ?
      ownerRef.current : ctrlRef.current, [triggerBy]);
  useEvent(EventListener.click,
      useCallback(handleClick, [pcState, triggerBy]),
      true, ctrlElem);
  useEvent(EventListener.keyDown,
      useCallback(handleKeyDown, [pcState, triggerBy]),
      true, ctrlElem);
  useEvent(EventListener.mouseEnter,
      useCallback(
          (e) => handleHover(e, Active.active, EventListener.mouseEnter),
          [triggerBy]),
      true, ctrlElem);
  useEvent(EventListener.mouseLeave,
      useCallback(
          (e) => handleHover(e, Active.disactive, EventListener.mouseLeave),
          [triggerBy]),
      true, ctrlElem);
  useEvent(EventListener.focus,
      useCallback((e) => handleHover(e, Active.active, EventListener.focus),
          [triggerBy]),
      true, ctrlElem);
  useEvent(EventListener.blur,
      useCallback((e) => handleHover(e, Active.disactive, EventListener.blur),
          [triggerBy]),
      true, ctrlElem);

  //add listeners for body
  const bodyElem = useCallback(() => bodyRef.current, [triggerBy]);
  useCombinedListeners(bodyElem,
      (e) => handleHover(e, Active.active, 'bodyMouseEnter'),
      (e) => handleHover(e, Active.disactive, 'bodyMouseLeave'), [triggerBy]);
  console.log('===============');
  return <>
    {getPopupCtrl()}
    {realPopupBody}
  </>;

});

export default PopupController;