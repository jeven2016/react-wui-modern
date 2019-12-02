import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {isBlank, isNil} from '../Utils';
import Menu from '../menu';
import {Badge, Dropdown, preventEvent, Row} from '../index';
import Input from '../Input';
import {IconArrowDown, IconArrowUp, IconChecked2, IconNoData} from '../Icons';
import Element from '../common/Element';
import Col from '../grid/Col';
import {reducer, ActionType} from './SelectReducer';

const Select = React.forwardRef((props, ref) => {
  const {
    block,
    defaultValue,
    placeholder,
    triggerBy = 'click',
    size = 'medium',
    disabled = false,
    searchable = true,
    autoWidth = true,
    multiple = false,
    hasBorder = true,
    style,
    searchDelay,
    noDataText = 'No Data',
    onChange,
    onSearch,
    onOpen,
    onClose,
    children,
    ...otherProps
  } = props;
  const inputRef = ref ? ref : useRef(null);
  const menuRef = useRef(null);
  const detectRef = useRef(null);
  const multipleSelectRef = useRef(null);

  const [state, dispatch] = useReducer(reducer, {
    showFilteredItems: false,
    activeIcon: false,
    searchedValue: null,
    selectedItems: [],
  });

  useEffect(() => {
    if (!autoWidth || disabled) {
      return;
    }

    const inputDomNode = inputRef.current;
    //adjust the input's width
    if (multiple && !isBlank(state.searchedValue)) {
      inputDomNode.style.width = detectRef.current.offsetWidth + 'px';
    }

    //adjust the menu's width
    const menuDomNode = menuRef.current;
    if (menuDomNode) {
      let rect;
      if (multiple) {
        rect = multipleSelectRef.current.getBoundingClientRect();
      } else {
        rect = inputDomNode.getBoundingClientRect();
      }
      const width = rect.width;
      menuRef.current.parentNode.style.width = `${width}px`;
    }
  });

  const handleItemClick = (item, e) => {
    const data = {
      searchedValue: item.value,
      multiple: multiple,
      clickItem: item,
      callback: () => {
        onChange(item);
      },
    };

    if (multiple) {
      dispatch({
        type: ActionType.multipleClickItem,
        isSelectedByValue: isSelectedByValue,
        data: {
          ...data,
          callback: (items) => {
            onChange(items);
          },
        },
      });
      return;
    }

    dispatch({
      type: ActionType.clickItem,
      data: data,
    });
  };

  //get all items information
  const allItemsInfo = useMemo(() => {
    return React.Children.map(children, child => {
      return {
        value: child.props.value,
        text: child.props.text,
        children: child.props.children,
      };
    });
  }, [children]);

  const findItemInfoByValue = (val) => {
    return allItemsInfo.find(v => v.value === val);
  };

  const isSelectedByValue = (val) => {
    return state.selectedItems.find(item => item.value === val);
  };

  let getDefaultText = useCallback(() => {
    const selectedItemInfo = findItemInfoByValue(defaultValue);
    if (!isNil(selectedItemInfo)) {
      const itemText = selectedItemInfo.text;
      return isNil(itemText) ? selectedItemInfo.children : itemText;
    }
    return null;
  }, [children, defaultValue]);

  const getSelectedMenuItem = () => {
    if (multiple) {
      return state.selectedItems.map(item => item.value);
    }

    return state.selectedItems.length === 0
        ? [defaultValue]
        : state.selectedItems.map(item => item.value);
  };

  const displayedItems = getSelectedMenuItem().map((val, index) => {
    return <Badge key={val + index} type="tag" color="gray">
      <span>{val}</span>
      <span style={{marginLeft: '0.25rem'}}>×</span>
    </Badge>;
  });

  //get input value to display
  const getText = () => {
    if (multiple && isBlank(state.searchedValue)) {
      return '';
    }

    if (!isBlank(state.searchedValue)) {
      return state.searchedValue;
    }

    if (state.selectedItems.length === 0) {
      return getDefaultText();
    }
    return state.selectedItems[0].text;
  };
  const displayText = getText();

  const inputStyle = searchable ? null : {cursor: 'pointer', ...style};

  const handleOpen = () => {
    dispatch({type: ActionType.open, data: {callback: onOpen}});
  };
  const handleClose = () => {
    dispatch({type: ActionType.close, data: {callback: onClose}});
  };

  const handleMouseLeave = (e) => {
    console.log('mouse leave');
  };

  const handleBlur = (e) => {
    console.log('blur');
  };

  const searchText = (e) => {
    dispatch({
      type: ActionType.search, data: {
        searchedValue: e.target.value, selectedItem: null,
      },
    });
  };

  const filterItems = useCallback(() => {
    const newChild = children.filter((chd) => !isNil(chd.props.value) &&
        chd.props.value.includes(state.searchedValue));

    if (newChild.length === 0) {
      return [];
    }
    return newChild;
  }, [state.searchedValue, children]);

  const convertToMultipleItem = (chdren) => {
    if (!multiple) {
      return chdren;
    }
    return React.Children.map(chdren, oneChild => {
      const childText = isNil(oneChild.props.text)
          ? oneChild.props.children
          : oneChild.props.text;

      const childProps = {
        ...oneChild.props,
        text: childText,
      };

      const newChild = <>
        <Option.Center>{childText}</Option.Center>
        {
          isSelectedByValue(oneChild.props.value)
              ? <Option.Right><IconChecked2/></Option.Right>
              : null
        }
      </>;
      return React.cloneElement(oneChild, childProps, newChild);
    });
  };

  const getDisplayItems = () => {
    if (!state.showFilteredItems || isBlank(state.searchedValue)) {
      return convertToMultipleItem(children);
    }

    return convertToMultipleItem(filterItems());
  };
  const finalItems = getDisplayItems();

  const canClickClose = (isClickPopup, isClickCtrl) => {
    //if it display no data or the multiple is set, the list won't be closed while clicking the list item
    if (multiple || finalItems.length === 0) {
      return false;
    }
    return !isClickCtrl;
  };

  const getInput = () => {
    const realPlaceholder = multiple ? null : placeholder;

    const input = <>
      <Input placeholder={realPlaceholder} readOnly={!searchable}
             ref={inputRef}
             style={inputStyle}
             {...otherProps}
             value={displayText || ''}
             onChange={searchText}
             onMouseLeave={handleMouseLeave}
             onBlur={handleBlur}
             disabled={disabled}/>
    </>;
    if (multiple) {
      return <Element nativeType="span" ref={multipleSelectRef}
                      className={multiple ? 'select-multiple' : null}
                      onClick={() => {inputRef.current.focus();}}
                      onFocus={() => {inputRef.current.focus();}}>
        <span className="select-multiple-content">

        {
          displayedItems
        }
          {input}
          <span ref={detectRef} className="search-text-detector">
        {/*this used to detect the width of the input value in pixel*/}
            {state.searchedValue}
      </span>
        </span>
      </Element>;
    }
    return <Input.IconInput disabled={disabled} block={block} size={size}>
      {input}
      {state.activeIcon ? <IconArrowUp/> : <IconArrowDown/>}
    </Input.IconInput>;
  };

  const suffix = 'dropdown-menu select-menu ';
  const menuBodyCls = hasBorder ? suffix + ' global-with-border' : suffix;

  return <Dropdown disabled={disabled}
                   selectable={true}
                   triggerBy={triggerBy}
                   margin={5}
                   onOpen={handleOpen}
                   onDropdownAutoClose={canClickClose} //don't auto close the list while no data filtered
                   onClose={handleClose}
                   bodyClassName={menuBodyCls}
                   onSelect={handleItemClick}>
    <Dropdown.Title>
      {getInput()}
    </Dropdown.Title>
    {
      (finalItems.length === 0) ?
          <Element className="no-data">
            <div>
              <Row justify="center" aligin="center">
                <Col>
                  <IconNoData extraClassName="no-data-icon"/>
                </Col>
              </Row>
              <Row justify="center" aligin="center">
                <Col><span className="no-data-label">{noDataText}</span></Col>
              </Row>
            </div>
          </Element>
          :
          <Menu block ref={menuRef} autoSelectItem={false}
                hasBackground={true}
                activeItems={getSelectedMenuItem()}>
            <Menu.List>
              {finalItems}
            </Menu.List>
          </Menu>
    }
  </Dropdown>;
});

const Option = React.forwardRef((props, ref) => {
  const {id, value, text, ...otherProps} = props;

  return <Menu.Item id={id} value={value} text={text} hasBackground
                    ref={ref} {...otherProps}/>;
});
Option.Left = Menu.Item.Left;
Option.Center = Menu.Item.Center;
Option.Right = Menu.Item.Right;
Select.Option = Option;
export default Select;