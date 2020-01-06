import { LocationChangeAction } from 'connected-react-router';
import { DefaultCRUDActions, CRUDActions, Params } from './createCRUDActions';
import {
  OnLocationChanged,
  handleLocationChanged
} from './handleLocationChanged';
import { transformDatabyId, removeFromArray } from './utils';
import { AllowedNames } from './typings';

const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

export interface CRUDState<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> {
  byIds: { [X in I[K]]?: I };
  ids: Array<I[K] | null>;
  list: Array<I | Partial<I>>;
  pageNo: number;
  pageSize: number;
  params: Params;
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
}

function isLocationChangeAction(action: any): action is LocationChangeAction {
  return action.type === LOCATION_CHANGE;
}

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey> = AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
>({
  key,
  actions,
  pageSize = 10,
  onLocationChanged = handleLocationChanged,
  ...initialState
}: CreateCRUDReducerOptions<I, K, A>) {
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

  function crudReducer(
    state = crudInitialState,
    action:
      | CRUDActions<I, K, Required<DefaultCRUDActions>>
      | LocationChangeAction
  ): CRUDState<I, K> {
    if (isLocationChangeAction(action)) {
      return onLocationChanged
        ? onLocationChanged(crudInitialState, state, action)
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
              [...state.ids, ...new Array(total).fill(null)],
              ids
            ).slice(0, total),
            list: insert<I, Partial<I>>(
              [...state.list, ...new Array(total).fill({})],
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
            const newUser = {
              ...state.byIds[id],
              ...action.payload
            };
            return {
              ...state,
              byIds: {
                ...state.byIds,
                [id]: newUser
              },
              list: [
                ...state.list.slice(0, index),
                newUser,
                ...state.list.slice(index + 1)
              ]
            };
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
  }

  return [crudInitialState, crudReducer] as const;
}
