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

const [todoInitialState, todoReducer] = createCRUDReducer<
  Schema$Todo,
  'uniqueID' // this generic is not required
>({
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

## URL Params Params

By default, the initial state will initialize `pageNo` and `params` from URL search params. And update after location change if using with `connected-react-router`. See

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
