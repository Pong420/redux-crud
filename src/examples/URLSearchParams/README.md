## Usage with URL search param

1. install [connected-react-router](https://github.com/supasate/connected-react-router) and [qs](https://github.com/ljharb/qs)

```
yarn add connected-react-router qs
```

2. Setup [connected-react-router](https://github.com/supasate/connected-react-router)

3. create selector

```ts
import { paginationSelector } from '@pong420/redux-crud';
import { RootState } from '../reducers';
import qs from 'qs';

interface Params {
  pageNo?: string;
  filter?: string;
}

function parsePageNo(payload: any) {
  const pageNo = Number(payload);
  return isNaN(pageNo) ? 1 : pageNo;
}

export const searchParamSelector = (state: RootState) => {
  const { pageNo, filter } = qs.parse(
    state.router.location.search.slice(1)
  ) as Params;

  return {
    pageNo: parsePageNo(pageNo),
    filter,
  } as const;
};

export const userPaginationSelector = ({ pageNo }: { pageNo?: number }) => (
  state: RootState
) => paginationSelector({ ...state.user, ...(pageNo && { pageNo }) });
```

4. Usage

```ts
const { pageNo, filter } = useSelector(searchParamSelector);

const { data, ids, total, pageSize, defer } = useSelector(
  userPaginationSelector({ pageNo: pageNo || 1 })
);

useEffect(() => {
  if (!defer) {
    axios.get('/api', { params: { pageNo, filter } });
  }
}, [pageNo, filter, defer]);

useEffect(() => {
  dispatch(reset());
}, [search]);
```
