import { ParsedQuery } from 'query-string';
import { CRUDState } from './createCRUDReducer';

export type PaginationSelectorReturnType<S extends CRUDState<any, any>> = {
  data: S['list'];
  ids: S['ids'];
  pageNo: number;
  pageSize: number;
  total: number;
  hasData: boolean;
  params: ParsedQuery;
};

export function paginationSelector<S extends CRUDState<any, any>>({
  list,
  ids: _ids,
  pageNo,
  pageSize,
  params
}: S): PaginationSelectorReturnType<S> {
  const start = (pageNo - 1) * pageSize;
  const data = list.slice(start, start + pageSize);
  const ids = _ids.slice(start, start + pageSize);

  let hasData = !!data.length;
  for (const item of data) {
    if (Object.keys(item).length === 0) {
      hasData = false;
      break;
    }
  }

  return { data, ids, pageNo, params, pageSize, total: list.length, hasData };
}
