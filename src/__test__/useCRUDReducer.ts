import qs from 'qs';
import { useMemo, useReducer, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createCRUDActions,
  createCRUDReducer,
  CreateCRUDReducerOptions,
  AllowedNames
} from '../';
import { withDispatch } from './withDispatch';

//
export interface UseCRUDReducerProps<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>
  extends Pick<
    CreateCRUDReducerOptions<I, K, any>,
    'key' | 'ids' | 'list' | 'pageSize'
  > {}

export function useCRUDReducer<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey> = AllowedNames<I, PropertyKey>
>({ key, ids, list, pageSize }: UseCRUDReducerProps<I, K>) {
  const location = useLocation();

  const { actionsCreators, initialState, reducer, init } = useMemo(() => {
    const [actionsCreators, actionTypes] = createCRUDActions<I, K>()({
      create: ['CREATE', 'CREATE'],
      update: ['UPDATE', 'UPDATE'],
      delete: ['DELETE', 'DELETE'],
      paginate: ['PAGINATE', 'PAGINATE']
    });

    const [initialState, reducer] = createCRUDReducer<I, K>({
      key,
      pageSize,
      actions: actionTypes,
      ids: ids || [],
      list: list || []
    });

    // Initialize params here instead of `createCRUDReducer`,
    // prevent error when dispatch 'RESET'
    function init(state: typeof initialState) {
      const { pageNo, ...params } = qs.parse(window.location.search.slice(1));
      return { ...state, params, pageNo: (pageNo || state.pageNo) as number };
    }

    return {
      actionsCreators,
      initialState,
      reducer,
      init
    };
  }, [key, ids, list, pageSize]);

  const [state, dispatch] = useReducer(reducer, initialState, init);

  const actions = useMemo(() => withDispatch(actionsCreators, dispatch), [
    dispatch,
    actionsCreators
  ]);

  useEffect(() => {
    dispatch({
      type: '@@router/LOCATION_CHANGE',
      payload: {
        isFirstRendering: false,
        location,
        action: 'PUSH'
      }
    });
  }, [dispatch, location]);

  return [state, actions] as const;
}
