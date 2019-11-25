import {multipleClickAction} from './ClickHandler';
import {invoke} from '../Utils';

const ActionType = {
  open: 'open',
  close: 'close',
  clickItem: 'clickItem',
  multipleClickItem: 'multipleClickItem',
  search: 'search',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionType.open:
      invoke(action.data.callback);
      return {...state, activeIcon: true, showFilteredItems: false};

    case ActionType.close:
      invoke(action.data.callback);
      return {
        ...state,
        searchedValue: null,
        activeIcon: false,
        showFilteredItems: false,
      };

    case ActionType.clickItem:
      invoke(action.data.callback);
      const data = action.data;

      return {
        ...state,
        searchedValue: null,
        selectedItems: [data.clickItem],
        showFilteredItems: false,
      };

    case ActionType.multipleClickItem:
      return multipleClickAction(state, action);

    case ActionType.search:
      const searchData = action.data;
      return {
        ...state,
        searchedValue: searchData.searchedValue,
        selectedItem: searchData.selectedItem,
        showFilteredItems: true,
      };
  }
};

export {
  ActionType,
  reducer,
};