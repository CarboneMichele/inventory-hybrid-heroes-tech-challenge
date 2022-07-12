import { Action, Reducer } from 'redux';
import { Injectable } from '@angular/core';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '.';
import config from '../config';

export interface Inventory {
  id: string;
  createdTime: string;
  fields: {
    Posted: string;
    'Product Code': string;
    'Product Image'?: string;
    'Product Name'?: string;
    'Product Categories'?: string;
  };
}

export interface InventoryState {
  fetching: boolean;
  sending: boolean;
  byId: { [id: string]: Inventory };
  allIds: string[];
  pagination: {
    offset: string;
    allRecords: Inventory[];
  };
}

const initialState = {
  fetching: false,
  sending: false,
  byId: {},
  allIds: [],
  pagination: {
    offset: '0',
    allRecords: []
  },
};

const FETCH_INVENTORY = 'FETCH_INVENTORY';
const FETCH_INVENTORY_SUCCESS = 'FETCH_INVENTORY_SUCCESS';
const FETCH_INVENTORY_ERROR = 'FETCH_INVENTORY_ERROR';
const SEND_INVENTORY = 'SEND_INVENTORY';
const SEND_INVENTORY_SUCCESS = 'SEND_INVENTORY_SUCCESS';
const SEND_INVENTORY_ERROR = 'SEND_INVENTORY_ERROR';

interface FetchInventoryAction extends Action<typeof FETCH_INVENTORY> {}
interface FetchInventorySuccessAction
  extends Action<typeof FETCH_INVENTORY_SUCCESS> {
  payload: {
    records: Inventory[];
    offset: string;
  };
}
interface FetchInventoryErrorAction
  extends Action<typeof FETCH_INVENTORY_ERROR> {
  error: boolean;
  payload: Error;
}

interface SendInventoryAction extends Action<typeof SEND_INVENTORY> {}
interface SendInventorySuccessAction
  extends Action<typeof SEND_INVENTORY_SUCCESS> {
  payload: Inventory;
}
interface SendInventoryErrorAction extends Action<typeof SEND_INVENTORY_ERROR> {
  error: boolean;
  payload: Error;
}
export type InventoryAction =
  | FetchInventoryAction
  | FetchInventorySuccessAction
  | FetchInventoryErrorAction
  | SendInventoryAction
  | SendInventorySuccessAction
  | SendInventoryErrorAction;

@Injectable({
  providedIn: 'root',
})
export class InventoryActions {
  constructor() {}

  fetchInventory =
    (refresh: boolean = false): ThunkAction<void, RootState, undefined, InventoryAction> =>
    (dispatch, getState) => {
      const { offset, allRecords } = getState().inventory.pagination;
      if (offset || refresh) {
        dispatch({ type: FETCH_INVENTORY });
        const fetchUrlParams = refresh ? `offset=0&view=Grid%20view` : `offset=${offset}&view=Grid%20view`;

        fetch(
          `https://api.airtable.com/v0/appJkRh9E7qNlXOav/Home?${fetchUrlParams}`,
          {
            headers: {
              Authorization: config.Authorization,
            },
          }
        )
          .then((response: any) => response.json())
          .then((body) => {
            dispatch({
              type: FETCH_INVENTORY_SUCCESS,
              payload: {
                records: refresh ? [...body.records] : [...allRecords, ...body.records],
                offset: body.offset ? body.offset : ''
              },
            });
          })
          .catch((e) => {
            dispatch({
              type: FETCH_INVENTORY_ERROR,
              error: true,
              payload: e,
            });
          });
      }
    };

  sendInventory =
    (data: string): ThunkAction<void, RootState, undefined, InventoryAction> =>
    (dispatch, getState) => {
      if (getState().inventory.sending) {
        return;
      }
      dispatch({ type: SEND_INVENTORY });

      fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`)
        .then((response) => response.json())
        .then((body) => {
          const name = body.product && body.product['product_name'];
          const categories = body.product && body.product['categories'];
          const image = body.product && body.product['image_url'];

          return fetch(
            'https://api.airtable.com/v0/appJkRh9E7qNlXOav/Home?maxRecords=100&view=Grid%20view',
            {
              method: 'POST',
              headers: {
                Authorization: config.Authorization,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  'Product Code': data,
                  'Product Name': name,
                  'Product Categories': categories,
                  'Product Image': image,
                },
              }),
            }
          );
        })
        .then((response: any) => response.json())
        .then((body) => {
          dispatch({ type: SEND_INVENTORY_SUCCESS, payload: body });
          dispatch(this.fetchInventory());
        })
        .catch((e) => {
          dispatch({
            type: SEND_INVENTORY_ERROR,
            error: true,
            payload: e,
          });
        });
    };
}

export const inventoryReducer: Reducer<InventoryState, InventoryAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case FETCH_INVENTORY:
      return {
        ...state,
        fetching: true,
      };
    case FETCH_INVENTORY_SUCCESS:
      return {
        ...state,
        fetching: false,
        byId: action.payload.records.reduce((byId, item) => {
          byId[item.id] = item;
          return byId;
        }, {}),
        allIds: action.payload.records.map((item) => item.id),
        pagination: {
          offset: action.payload.offset,
          allRecords: [...action.payload.records]
        },
      };
    case FETCH_INVENTORY_ERROR:
      return {
        ...state,
        fetching: false,
      };
    case SEND_INVENTORY:
      return {
        ...state,
        sending: true,
      };
    case SEND_INVENTORY_SUCCESS:
    case SEND_INVENTORY_ERROR:
      return {
        ...state,
        sending: false,
      };
    default:
      return state;
  }
};

export const selectors = {
  selectInventory: (state: RootState) =>
    state.inventory.allIds.map((id) => state.inventory.byId[id]),
  selectFetching: (state: RootState) => state.inventory.fetching,
};
