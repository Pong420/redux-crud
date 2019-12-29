import { Params } from './createCRUDActions';
import { CRUDState } from './createCRUDReducer';

export type PaginationSelectorReturnType<S extends CRUDState<any, any>> = {
  data: S['list'];
  ids: S['ids'];
  pageNo: number;
  pageSize: number;
  total: number;
  defer: boolean;
  params: Params;
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

  let defer = !!data.length;
  for (const item of data) {
    if (Object.keys(item).length === 0) {
      defer = false;
      break;
    }
  }

  return { data, ids, pageNo, params, pageSize, total: list.length, defer };
}
