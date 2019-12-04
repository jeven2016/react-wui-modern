import React, {
  useLayoutEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import clsx from 'clsx';
import {Active, EventListener, PopupCtrlType} from './Constants';
import useEvent from './UseEvent';
import {isNil, placePadding, setTransformOrigin} from '../Utils';
import * as ReactDOM from 'react-dom';
import {CSSTransition} from 'react-transition-group';
import useContainer from './useContainer';
import Element from './Element';
import Button from '../button';

const PopupController = React.forwardRef((props, ref) => {
  const [pcState, setPcState] = useState({activePopup: Active.na});
  const contentRef = useRef(null);
  const {
    nativeType = 'span',
    onHover,
    disabled = false,
    setChildDisabled = true,// whether to copy disabled for child node( ctrl )
    className = 'popup-ctrl',
    position = 'bottomLeft',
    defaultActive,
    autoClose = true, //auto close the content even though the defaultActive is true
    onAutoClose, // the callback would be invoked while clicking document and trying to close the popup, true : the popup will be closed
    triggerBy = PopupCtrlType.click,
    bodyOffset = '0.3rem',
    onOpen,
    onClose,
    margin = 0, //the popup margin value in px, to set the gap between the popup and ctrl
    handleChildren = () => {},
    children,
    ...otherProps
  } = props;
  const rootElem = useContainer('wui-portals');
  const internalRef = useRef(null);
  const ctrlRef = useRef(null);
  const isControlledByOther = () => !isNil(defaultActive);
  const canNotTrigger = isControlledByOther() && !autoClose;

  /**
   * Expose a close method to parent node inorder to close the popup outside this
   * component.
   */
  useImperativeHandle(ref, () => ({
    close: () => closePopup(),
  }));

  const closePopup = () => setPcState(
      {...pcState, activePopup: Active.disactive});

  useEvent(EventListener.click, (e) => {
    console.log('docuemnt click ' + className);
    // if the active state is maintained by outside and cannot be closed internally
    if (canNotTrigger) {
      return;
    }
    if (disabled || !isActive()) {
      return;
    }

    const isClickPopup = contentRef.current.contains(e.target);
    const isClickCtrl = ctrlRef.current.contains(e.target);

    // console.log(`isClickPopup=${isClickPopup}, isClickCtrl=${isClickCtrl}`);
    // console.log(`target=`);
    // console.log(e.target);
    // console.log(ctrlRef.current);
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
      const contentDomNode = contentRef.current;
      setTransformOrigin(contentDomNode, position);
      placePadding(contentDomNode, ctrlRef.current, position, bodyOffset,
          margin);
    }
  };

  useLayoutEffect(() => {
    move();
  });

  const handleHover = (e, nextActiveState) => {
    if (disabled || canNotTrigger) {
      return;
    }

    if (!PopupCtrlType.isHover(triggerBy) || nextActiveState ===
        pcState.activePopup) {
      return;
    }

    if (isNil(nextActiveState)) {
      onHover && onHover(e, isActive(nextActiveState));
      return;
    }

    setPcState({
      ...pcState,
      activePopup: nextActiveState,
    });

    handleCallback(nextActiveState);
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
      <div className={cls} ref={contentRef}>
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
      onClick: clickCtrl,
      onMouseEnter: (e) => handleHover(e, Active.active),
      onFocus: (e) => handleHover(e, Active.active),
      onMouseLeave: (e) => handleHover(e, Active.disactive),
      onBlur: (e) => handleHover(e, Active.disactive),
    };

    return React.cloneElement(ctrl, ctrlProps);
  };

  return <>
    {getPopupCtrl()}
    {popupBody}
  </>;

});

export default PopupController;