import { IParseOptions } from 'qs';
import { Reducer } from 'redux';
import { LocationChangeAction } from 'connected-react-router';
import { DefaultCRUDActions, CRUDActions } from './createCRUDActions';
import {
  OnLocationChanged,
  handleLocationChanged
} from './handleLocationChanged';
import { transformDatabyId, removeFromArray } from './utils';
import { AllowedNames } from './typings';

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

export interface CRUDState<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  P extends boolean = true
> {
  byIds: { [X in I[K]]?: I };
  ids: P extends true ? Array<I[K] | null> : I[K][];
  list: P extends true ? Array<I | Partial<I>> : I[];
  pageNo: number;
  pageSize: number;
  params: any;
  pathname?: string;
}

export interface CreateCRUDReducerOptions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions
> extends Partial<CRUDState<I, K>> {
  key: K;
  actions: A;
  onLocationChanged?: OnLocationChanged | null;
  parseOptions?: IParseOptions;
  prefill?: boolean;
}

type CRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  P extends boolean = true
> = Reducer<
  CRUDState<I, K, P>,
  CRUDActions<I, K, Required<DefaultCRUDActions>> | LocationChangeAction
>;

function isLocationChangeAction(action: any): action is LocationChangeAction {
  return action.type === LOCATION_CHANGE;
}

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey> = AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
>(
  options: CreateCRUDReducerOptions<I, K, A> & { prefill: false }
): [CRUDState<I, K, false>, CRUDReducer<I, K, false>];

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey> = AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
>(
  options: CreateCRUDReducerOptions<I, K, A> & { prefill?: true }
): [CRUDState<I, K, true>, CRUDReducer<I, K, true>];

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey> = AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
>(
  options: CreateCRUDReducerOptions<I, K, A>
): [CRUDState<I, K>, CRUDReducer<I, K>] {
  const {
    key,
    actions,
    pageSize = 10,
    parseOptions,
    onLocationChanged = handleLocationChanged,
    prefill = true,
    ...initialState
  } = options;
  const crudInitialState: CRUDState<I, K> = {
    ids: [],
    list: [],
    byIds: {},
    pageNo: 1,
    pageSize,
    params: {},
    ...(onLocationChanged && {
      pathname: window.location.pathname.slice(
        (process.env.PUBLIC_URL || '').length
      )
    }),
    ...initialState
  };

  const crudReducer: CRUDReducer<I, K> = (state = crudInitialState, action) => {
    if (isLocationChangeAction(action)) {
      return onLocationChanged
        ? onLocationChanged(crudInitialState, state, action, parseOptions)
        : state;
    }

    if (actions[action.sub] !== action.type) {
      return state;
    }

    switch (action.sub) {
      case 'CREATE':
        return (() => {
          const id = action.payload[key];

          return {
            ...state,
            ids: [...state.ids, id],
            list: [...state.list, action.payload],
            byIds: { ...state.byIds, [id]: action.payload },
            pageNo: Math.floor(state.list.length / pageSize) + 1
          };
        })();

      case 'PAGINATE':
        return (() => {
          const { pageNo, data, total } = action.payload;
          const { byIds, ids } = transformDatabyId(data, key);
          const start = (pageNo - 1) * pageSize;
          const insert = <T1, T2>(arr: T1[], ids: T2[]) => [
            ...arr.slice(0, start),
            ...ids,
            ...arr.slice(start + pageSize)
          ];

          return {
            ...state,
            pageNo,
            ids: insert<I[K], null>(
              [...state.ids, ...(prefill ? new Array(total).fill(null) : [])],
              ids
            ).slice(0, total),
            list: insert<I, Partial<I>>(
              [...state.list, ...(prefill ? new Array(total).fill({}) : [])],
              data
            ).slice(0, total),
            byIds: {
              ...state.byIds,
              ...byIds
            }
          };
        })();

      case 'DELETE':
        return (() => {
          const { [key]: id } = action.payload;
          const index = state.ids.indexOf(id);

          const byIds = { ...state.byIds };
          delete byIds[id];

          const total = state.list.length - 1;

          return {
            ...state,
            ids: removeFromArray(state.ids, index),
            list: removeFromArray(state.list, index),
            byIds,
            pageNo: Math.min(
              Math.max(1, Math.ceil(total / pageSize)),
              state.pageNo
            )
          };
        })();

      case 'UPDATE':
        return (() => {
          const id: I[K] = action.payload[key] as any;
          const index = state.ids.indexOf(id);

          if (index !== -1) {
            const newItem = {
              ...state.byIds[id],
              ...action.payload
            };
            return {
              ...state,
              byIds: {
                ...state.byIds,
                [id]: newItem
              },
              list: [
                ...state.list.slice(0, index),
                newItem,
                ...state.list.slice(index + 1)
              ]
            };
          } else {
            console.warn(`[redux-crud] Fail to update as ${id} not exists`);
          }

          return state;
        })();

      case 'SET_PAGE':
        return { ...state, pageNo: action.payload };

      case 'SET_PARAMS':
        return { ...state, params: action.payload };

      case 'RESET':
        return { ...crudInitialState, pageNo: 1, ...action.payload };

      default:
        return state;
    }
  };

  return [crudInitialState, crudReducer];
}
