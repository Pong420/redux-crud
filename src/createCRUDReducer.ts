import { transformDatabyId, removeFromArray, parsePageNo } from './utils';
import { AllowedNames, ValueOf } from './typings';
import { LocationChangeAction } from 'connected-react-router';
import qs from 'querystring';

const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

export interface CRUDState<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> {
  byIds: Record<I[K], I>;
  ids: Array<I[K] | null>;
  list: Array<I | Partial<I>>;
  pageNo: number;
  pageSize: number;
  search?: string;
  pathname?: string;
}

interface PagePayload<T> {
  data: T[];
  total: number;
  pageNo: number;
}

export type CRUDActionsTypes =
  | 'RESET'
  | 'CREATE'
  | 'DELETE'
  | 'UPDATE'
  | 'PAGINATE'
  | 'SET_PAGE';

export type DefaultCRUDActions = Record<CRUDActionsTypes | string, string>;

export type CRUDActionsMap<
  I extends Record<PropertyKey, any> = any,
  K extends AllowedNames<I, PropertyKey> = any,
  A extends DefaultCRUDActions = any
> = {
  RESET: { type: A['RESET']; sub: 'RESET' };
  CREATE: { type: A['CREATE']; sub: 'CREATE'; payload: I };
  DELETE: { type: A['DELETE']; sub: 'DELETE'; payload: Pick<I, K> };
  UPDATE: {
    type: A['UPDATE'];
    sub: 'UPDATE';
    payload: Pick<I, K> & Partial<I>;
  };
  PAGINATE: { type: A['PAGINATE']; sub: 'PAGINATE'; payload: PagePayload<I> };
  SET_PAGE: { type: A['SET_PAGE']; sub: 'SET_PAGE'; payload: number };
};

export type CRUDActions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = any
> = ValueOf<CRUDActionsMap<I, K, A>>;

export interface CreateCRUDReducerOptions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions
> extends Partial<CRUDState<I, K>> {
  key: I[AllowedNames<I, PropertyKey>];
  actions?: A;
  disableSearchParams?: boolean;
}

function isLocationChangeAction(action: any): action is LocationChangeAction {
  return action.type === LOCATION_CHANGE;
}

export function isPagePayload<T>(obj: any): obj is PagePayload<T> {
  return !!(
    obj &&
    typeof obj === 'object' &&
    obj.hasOwnProperty('pageNo') &&
    obj.hasOwnProperty('data')
  );
}

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
>({
  key,
  actions,
  pageSize = 10,
  disableSearchParams,
  ...initialState
}: CreateCRUDReducerOptions<I, K, A>) {
  const crudInitialState: CRUDState<I, K> = {
    ids: [],
    list: [],
    byIds: {} as CRUDState<I, K>['byIds'],
    pageNo: 1,
    pageSize,
    search: (qs.parse(window.location.search.slice(1)) as Record<
      string,
      string
    >).search,
    pathname: window.location.pathname.slice(
      (process.env.PUBLIC_URL || '').length
    ),
    ...initialState,
  };

  function crudReducer(
    state = crudInitialState,
    action: CRUDActions<I, K, A> | LocationChangeAction
  ): CRUDState<I, K> {
    if (isLocationChangeAction(action)) {
      if (disableSearchParams) return state;

      return (() => {
        const { location } = action.payload;
        const params: { search?: string; pageNo?: string } = qs.parse(
          location.search.slice(1)
        );
        const leave = location.pathname !== state.pathname;
        const searchChanged = params.search !== state.search;

        if (leave) {
          return {
            ...crudInitialState,
            pathname: location.pathname,
            search: undefined,
            pageNo: 1,
          };
        }

        if (searchChanged) {
          return {
            ...crudInitialState,
            search: params.search,
            pageNo: 1,
          };
        }

        return {
          ...state,
          search: params.search,
          pageNo: parsePageNo(params.pageNo),
        };
      })();
    }

    if (actions && actions[action.sub] !== action.type) {
      return state;
    }

    switch (action.sub) {
      case 'RESET':
        return { ...crudInitialState, pageNo: 1 };

      case 'SET_PAGE':
        return { ...state, pageNo: action.payload };

      case 'CREATE':
        return (() => {
          const id = action.payload[key];

          return {
            ...state,
            ids: [...state.ids, id],
            list: [...state.list, action.payload],
            byIds: { ...state.byIds, [id]: action.payload },
            pageNo: Math.floor(state.list.length / pageSize) + 1,
          };
        })();

      case 'PAGINATE':
        return (() => {
          const { pageNo, data, total } = action.payload;
          const { byIds, ids } = transformDatabyId(data, key);
          const start = (pageNo - 1) * pageSize;
          const insert = <T>(arr: T[], ids: T[]) => [
            ...arr.slice(0, start),
            ...ids,
            ...arr.slice(start + pageSize),
          ];

          return {
            ...state,
            pageNo,
            ids: insert(
              [...state.ids, ...(new Array(total).fill(null) as Array<null>)],
              ids
            ).slice(0, total),
            list: insert(
              [...state.list, ...(new Array(total).fill({}) as Partial<I>[])],
              data
            ).slice(0, total),
            byIds: {
              ...state.byIds,
              ...byIds,
            },
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
            ),
          };
        })();

      case 'UPDATE':
        return (() => {
          const id: I[K] = action.payload[key] as any;
          const index = state.ids.indexOf(id);

          const newUser = {
            ...state.byIds[id],
            ...action.payload,
          };
          return {
            ...state,
            byIds: {
              ...state.byIds,
              [id]: newUser,
            },
            list: [
              ...state.list.slice(0, index),
              newUser,
              ...state.list.slice(index + 1),
            ],
          };
        })();

      default:
        return state;
    }
  }

  return [crudInitialState, crudReducer] as const;
}
