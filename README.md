## Redux CRUD

[Demo - Todo Task](https://stackblitz.com/edit/react-redux-crud-todo)

[Demo - Pagination](https://stackblitz.com/edit/react-redux-crud-pagination)

[Demo - with React.useReducer](https://stackblitz.com/edit/react-redux-crud-todo-nyrfms?file=useCRUDReducer.ts)

## Installation

```
yarn add @pong420/redux-crud
```

## Basic Example

`/typings.ts`

```ts
export interface Schema$Todo {
  uniqueID: string;
  task: string;
  completed: boolean;
}
```

`/store/actions.ts`

```ts
import { Schema$Todo } from '../typings';
import { getCRUDActionCreator, UnionCRUDActions } from '@pong420/redux-crud';

// The first value in the array specified, the second value can be any string.
// You can define the action you need only
export const [todoActions, TodoActionTypes] = createCRUDActions<
  Schema$Todo,
  'id'
>()({
  // you could just add the actions that you needs
  createTodo: ['CREATE', 'CREATE_TODO'],
  deleteTodo: ['DELETE', 'DELETE_TODO'],
  updateTodo: ['UPDATE', 'UPDATE_TODO'],
  paginateTodo: ['PAGINATE', 'PAGINATE_TODO'],
  setPageTodo: ['SET_PAGE', 'SET_PAGE_TODO'],
  resetTodo: ['RESET', 'RESET_TODO']
});
```

`/store/reducer.ts`

```ts
import { combineReducers, Reducer, AnyAction } from 'redux';
import { createCRUDReducer } from '@pong420/redux-crud';
import { Schema$Todo } from '../typings';

const [todoInitialState, todoReducer] = createCRUDReducer<Schema$Todo>({
  key: 'uniqueID',
  actions: TodoActionTypes
});

const rootReducer = () =>
  combineReducers({
    todo: todoReducer
  });

export default rootReducer;

export type RootState = ReturnType<ReturnType<typeof rootReducer>>;

```

## Options

You could add initial state here

```ts
const pageSize = 100;
const [state, reducer] = createCRUDReducer({
  // ...other otpions,
  pageNo: 1,
  pageSize,
  ids: new Arrary(pageSize).fill(null),
  list: new Arrary(pageSize).fill({})
});
```

#### prefill

By default, `list` and `ids` in `state` will prefill with `{}` and `null`. You could disable this feature by seting prefill to false

```ts
const [state, reducer] = createCRUDReducer({
  // ...other otpions
  prefill: false
});
```

#### onLocationChanged

If you are using `connected-react-router`. `pageNo` and `params` will initialize from URL search params. And `state` will reset when location changed

[Examples - Handle pageNo or filter on URL search params](src/examples/URLParamsParams)

To disable this feature, you can

```ts
const [state, reducer] = createCRUDReducer({
  // ...other otpions
  onLocationChanged: null
});
```

For **hash router**, you should assgin pathname yourself. Otherwise the `pageNo` and `params` will not initialize from search params

```ts
const [state, reducer] = createCRUDReducer({
  // ...other otpions
  pathname: window.location.hash.slice(1).replace(/\?.*/, '')
});
```

## TODO

- [ ] Add Docs
- [ ] Add Unit Test
