import React, {useEffect, useRef} from 'react';
import {MenuContext, setPadding} from './MenuUtils';
import {isNil} from '../Utils';
import clsx from 'clsx';
import {useActiveItems, useMenuList} from './BaseMenu';
import List from './List';
import Header from './Header';
import SubMenu from './SubMenu';

const MenuDirection = {
  horizontal: 'horizontal',
  vertical: 'vertical',
};

export const BaseMenu = React.forwardRef((props, ref) => {
  const {
    id,
    extraClassName,
    children,
    type,
    onClickItem,
    onClickHeader,
    onSelect,
    className,
    hasBorder,
    hasBox,
    hasBackground,
    disabled,
    block,
    selectable,
    multiSelect,
    autoSelectItem,
    setItemPaddingLeft,
    paddingLeftUnit,
    paddingLeftIncrement,
    defaultActiveItems,
    defaultOpenedMenus,

    collapsible = true,
    showMenuList,//internal use
    ...otherProps
  } = props;

  let clsName = clsx(extraClassName, className, {
    'global-with-border': hasBorder,
    'global-with-box': hasBox,
    'with-bg': hasBackground,
    [type]: type,
    block,
    close: collapsible && !showMenuList,
    show: collapsible && showMenuList,
    disabled: disabled,
  });

  return <ul className={clsName} ref={ref} {...otherProps}>
    {children}
  </ul>;
});

const NormalMenu = React.forwardRef(((props, ref) => {
  const {
    id,
    className,
    extraClassName,
    disabled,
    selectable,
    multiSelect,
    autoSelectItem,
    setItemPaddingLeft,
    paddingLeftUnit,
    paddingLeftIncrement,
    defaultActiveItems,
    defaultOpenedMenus,
    onClickHeader,
    onSelect,
    onClickItem,
    multiLevelMenus,
    menuDirection,
    hasBox,
    hasBorder,
    hasBackground,
    ...otherProps
  } = props;
  const menuRef = !isNil(ref) ? ref : useRef(null);

  //set padding-left property to items, only execute once
  useEffect(() => {
    if (!multiLevelMenus && setItemPaddingLeft) {
      //set padding-left property to child nodes
      setPadding(props, menuRef.current, 0);
    }
  }, []);

  let collapsible = false;
  React.Children.forEach(props.children, chd => {
    if (chd.type === List || chd.type === Header) {
      collapsible = true;
    }
  });

  const {isShow, handleHeader} = useMenuList(id, defaultOpenedMenus, disabled,
      onClickHeader);

  const {activeItems, handleItem} = useActiveItems(defaultActiveItems,
      onSelect,
      multiSelect,
      onClickItem,
      autoSelectItem,
      selectable);

  let clsName = clsx(extraClassName, className, {
    'normal': !multiLevelMenus,
    'popup-menu': multiLevelMenus,
    'menu-row': MenuDirection.horizontal === menuDirection,
    'menu-column': MenuDirection.vertical === menuDirection,
  });

  const content = <MenuContext.Provider
      value={{
        disabled: disabled,
        clickHeader: handleHeader,
        clickItem: handleItem,
        activeItems: activeItems,
        menuDisabled: disabled,
        defaultOpenedMenus: defaultOpenedMenus,
        menuType: props.type,
        multiLevelMenus: multiLevelMenus,
        multiSelect: multiSelect,
        hasBox: hasBox,
        hasBorder: hasBorder,
        hasBackground: hasBackground,
      }}>
    <BaseMenu className={clsName}
              hasBox={hasBox}
              hasBorder={hasBorder}
              hasBackground={hasBackground}
              collapsible={collapsible}
              ref={menuRef} showMenuList={isShow()}
              {...otherProps}/>
  </MenuContext.Provider>;
  return content;
}));

NormalMenu.defaultProps = {
  className: 'menu',
  hasBorder: false,
  hasBox: false,
  hasBackground: false,
  disabled: null,
  block: false,
  selectable: true,
  multiSelect: false,
  autoSelectItem: true,
  setItemPaddingLeft: true,
  paddingLeftUnit: 'rem',
  paddingLeftIncrement: 1,
  defaultActiveItems: [],
  defaultOpenedMenus: [],
  multiLevelMenus: false,
  menuDirection: MenuDirection.vertical,
};

export default NormalMenu;