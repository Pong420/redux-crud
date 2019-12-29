## Usage with URL search params

1. install [connected-react-router](https://github.com/supasate/connected-react-router) and [query-string](https://github.com/sindresorhus/query-string)

```
yarn add connected-react-router query-string
```

2. create hooks `useParamsParam.ts`

```ts
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import qs from 'query-string';

export function useParamsParam<T extends {}>() {
  const history = useHistory();
  const setParamsParam = useCallback(
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

  return { setParamsParam };
}
```

3. Then your can change `pageNo` and `params` using useParamsParam

```ts
const { setParamsParam } = useParamsParam();

setParamsParam({ pageNo: 2 });

// or
// keep other search params
setParamsParam(params => ({ ...params, pageNo: 2 }));
```
