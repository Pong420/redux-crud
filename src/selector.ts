import { CRUDState } from './createCRUDReducer';
import { AllowedNames } from './typings';

export type PaginationSelectorReturnType<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> = {
  data: CRUDState<I, K>['list'];
  ids: (I[K] | null)[];
  pageNo: number;
  pageSize: number;
  total: number;
  defer: boolean;
};

export function paginationSelector<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>({
  list,
  ids: _ids,
  pageNo,
  pageSize,
}: CRUDState<I, K>): PaginationSelectorReturnType<I, K> {
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

  return { data, ids, pageNo, pageSize, total: list.length, defer };
}
