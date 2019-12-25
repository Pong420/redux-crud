## Usage with URL search params

1. install [connected-react-router](https://github.com/supasate/connected-react-router) and [query-string](https://github.com/sindresorhus/query-string)

```
yarn add connected-react-router query-string
```

2. create hooks `useSearchParam.ts`

```ts
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import qs from 'query-string';

export function useSearchParam<T extends {}>() {
  const history = useHistory();
  const setSearchParam = useCallback(
    (payload: Partial<T> | ((params: Partial<T>) => Partial<T>)) => {
      const newState =
        typeof payload === 'function'
          ? payload(qs.parse(window.location.search.slice(1)) as T)
          : payload;

      for (const key in newState) {
        if (!newState[key]) {
          delete newState[key];
        }
      }
      history.push({ search: qs.stringify(newState) });
    },
    [history]
  );

  return { setSearchParam };
}
```

3. Then your could change `pageNo` and `search` using useSearchParam

```ts
const { setSearchParam } = useSearchParam();

setSearchParam({ pageNo: 2 });

// or
// keep other search params
setSearchParam(params => ({ ...params, pageNo: 2 }));
```
