## Extend Redux CRUD

### Baisc

```ts
const { crudInitialState, crudReducer } = createCRUDReducer<
  Schema$Todo,
  'uniqueID'
>({
  key: 'uniqueID',
});

interface Search {
  sub: 'SEARCH_TODO';
  payload: string;
}

type ExtendedActions = CRUDActions<Schema$Todo, 'uniqueID'> | Search;

interface State extends CRUDState<Schema$Todo, 'uniqueID'> {
  search: string;
}

const initialState: State = {
  ...crudInitialState,
  search: '',
};

function extendedReducer(state = initialState, action: ExtendedActions): State {
  switch (action.sub) {
    case 'SEARCH_TODO':
      return {
        ...crudInitialState,
        pageNo: 1,
        search: action.payload,
      };

    default:
      return { ...state, ...todoReducer(state, action) };
  }
}
```

### Advanced

```ts
import {
  createCRUDReducer,
  getCRUDActionCreator,
  paginationSelector,
  CRUDActionsMap,
  CRUDState,
  CRUDActions,
  CreateCRUDReducerOptions,
  PaginationSelectorReturnType,
} from '@pong420/redux-crud';
import { AllowedNames } from '../typings';
import qs from 'qs';

export interface CRUDStateEx<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> extends CRUDState<I, K> {
  search?: string;
}

interface Search {
  type: string;
  sub: 'SEARCH';
  payload: string;
}

export type CRUDActionsEx<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
> = CRUDActions<I, K> | Search;

export type PaginationAndSearchReturnType<
  I extends Record<PropertyKey, any>
> = PaginationSelectorReturnType<I> & { search?: string };

export function getCRUDActionCreatorEx<
  Types extends Record<keyof Actions, string>,
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  Actions extends CRUDActionsMap<I, K> = CRUDActionsMap<I, K>
>() {
  return {
    SEARCH: (type: Types[keyof Types]) => (
      payload: Search['payload']
    ): Search => ({
      sub: 'SEARCH',
      type,
      payload,
    }),
    ...getCRUDActionCreator<Types, I, K, Actions>(),
  };
}

export function createCRUDReducerEx<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>(
  props: CreateCRUDReducerOptions<I, K, CRUDActionsMap<I, K> & { SEARCH: Search }>
) {
  const { crudInitialState, crudReducer } = createCRUDReducer(props);

  const { search } = qs.parse(window.location.search.slice(0));

  const crudInitialStateEx: CRUDStateEx<I, K> = {
    ...crudInitialState,
    search,
  };

  function crudReducerEx(
    state = crudInitialStateEx,
    action: CRUDActionsEx<I, K>
  ): CRUDStateEx<I, K> {
    if (props.actions && props.actions[action.sub] !== action.type) {
      return state;
    }

    switch (action.sub) {
      case 'SEARCH':
        return { ...crudInitialState, pageNo: 1, search: action.payload };
      default:
        return crudReducer(state, action);
    }
  }

  return { crudInitialStateEx, crudReducerEx };
}

export function paginationAndSearchSelector<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>({ search, ...reset }: CRUDStateEx<I, K>): PaginationAndSearchReturnType<I> {
  return {
    search,
    ...paginationSelector(reset),
  };
}

export * from '@pong420/redux-crud';
```
