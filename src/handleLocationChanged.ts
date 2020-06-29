import { LocationChangeAction } from 'connected-react-router';
import { CRUDState } from './createCRUDReducer';
import { parsePageNo, isEqual } from './utils';
import qs, { IParseOptions } from 'qs';

export type OnLocationChanged = (
  initialState: CRUDState<any, any>,
  state: CRUDState<any, any>,
  action: LocationChangeAction,
  qsParseOptions?: IParseOptions
) => CRUDState<any, any>;

export const handleLocationChanged: OnLocationChanged = (
  initialState,
  state,
  action,
  qsParseOptions
) => {
  const { location } = action.payload;
  const { pageNo, ...params } = qs.parse(
    location.search.slice(1),
    qsParseOptions
  );
  const leave = location.pathname !== state.pathname;
  const paramsChanged = !isEqual(params, state.params);

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
    pageNo: parsePageNo(pageNo)
  };
};
