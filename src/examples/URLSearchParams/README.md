## Usage with URL search params

1. install [connected-react-router](https://github.com/supasate/connected-react-router) and [qs](https://github.com/ljharb/qs)

```
yarn add connected-react-router qs
yarn add --dev @types/qs
```

2. create hooks `useParamsParam.ts`

```ts
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import qs from 'qs';

export function useParamsParam<T extends {}>() {
  const history = useHistory();
  const setParamsParam = useCallback(
    (payload: Partial<T> | ((params: Partial<T>) => Partial<T>)) => {
      const newState =
        typeof payload === 'function'
          ? payload(qs.parse(window.location.search.slice(1)) as T)
          : payload;

      history.push({
        search: qs.stringify(
          JSON.parse(JSON.stringify(newState) // remove undefined
        )
      });
    },
    [history]
  );

  return { setParamsParam };
}
```

3. Then you can change `pageNo` and `params` using useParamsParam

```ts
const { setParamsParam } = useParamsParam();

setParamsParam({ pageNo: 2 });

// or
// keep other search params
setParamsParam(params => ({ ...params, pageNo: 2 }));
```
