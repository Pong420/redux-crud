import {
  TransformDataById,
  transformDatabyId,
} from './utils/transformDatabyId';
import { AllowedNames, ValueOf } from './typings';

export interface CRUDState<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> {
  byIds: TransformDataById<I, K, I>['byIds'];
  ids: Array<I[K] | null>;
  list: Array<I | Partial<I>>;
  pageNo: number;
  pageSize: number;
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

export type CRUDActionsMap<
  I extends Record<PropertyKey, any> = any,
  K extends AllowedNames<I, PropertyKey> = any,
  A extends Record<CRUDActionsTypes | string, string> = any
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
  A extends Record<CRUDActionsTypes | string, string> = any
> = ValueOf<CRUDActionsMap<I, K, A>>;

export interface CreateCRUDReducerOptions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends Record<CRUDActionsTypes | string, string>
> extends Partial<CRUDState<I, K>> {
  key: I[K];
  actions?: A;
}

export function isPagePayload<T>(obj: any): obj is PagePayload<T> {
  return !!(
    obj &&
    typeof obj === 'object' &&
    obj.hasOwnProperty('pageNo') &&
    obj.hasOwnProperty('data')
  );
}

function removeFromArray<T>(arr: T[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function createCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends Record<CRUDActionsTypes | string, string> = Record<
    CRUDActionsTypes | string,
    string
  >
>({
  key,
  actions,
  pageSize = 10,
  ...initialState
}: CreateCRUDReducerOptions<I, K, A>) {
  const crudInitialState: CRUDState<I, K> = {
    ids: [],
    list: [],
    byIds: {} as CRUDState<I, K>['byIds'],
    pageNo: 1,
    pageSize,
    ...initialState,
  };

  function crudReducer(
    state = crudInitialState,
    action: CRUDActions<I, K, A>
  ): CRUDState<I, K> {
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
          const { byIds, ids } = transformDatabyId<I, K, I>(data, key);
          const start = (pageNo - 1) * pageSize;
          const insert = <T>(arr: T[], ids: T[]) => [
            ...arr.slice(0, start),
            ...ids,
            ...arr.slice(start + pageSize),
          ];

          return {
            ...state,
            ids: insert(
              [
                ...state.ids,
                ...(new Array(total).fill(null) as Array<null>),
              ].slice(0, total),
              ids
            ),
            list: insert(
              [
                ...state.list,
                ...(new Array(total).fill({}) as Partial<I>[]),
              ].slice(0, total),
              data
            ),
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

  return { crudInitialState, crudReducer };
}
