import { LocationChangeAction } from 'connected-react-router';
import { CRUDState } from './createCRUDReducer';
import qs, { ParseOptions } from 'query-string';

export type OnLocationChanged = (
  initialState: CRUDState<any, any>,
  state: CRUDState<any, any>,
  action: LocationChangeAction
) => CRUDState<any, any>;

export function handleLocationChanged(
  initialState: CRUDState<any, any>,
  state: CRUDState<any, any>,
  action: LocationChangeAction,
  qsParseOptions: ParseOptions = {}
) {
  const { location } = action.payload;
  const { pageNo = 1, ...params } = qs.parse(location.search.slice(1), {
    ...qsParseOptions,
    parseNumbers: true,
    parseBooleans: true
  });
  const leave = location.pathname !== state.pathname;
  const keys = { ...state.params, ...params };

  let paramsChanged = false;

  for (const key in keys) {
    if (params[key] !== state.params[key]) {
      paramsChanged = true;
      break;
    }
  }

  if (leave) {
    return {
      ...initialState,
      pathname: location.pathname,
      params: {},
      pageNo: 1
    };
  }

  if (paramsChanged) {
    return {
      ...initialState,
      pathname: location.pathname,
      params,
      pageNo: 1
    };
  }

  return {
    ...state,
    pageNo: typeof pageNo === 'number' ? pageNo : 1,
    params
  };
}
