## Redux CRUD

[Demo - Todo Task](https://stackblitz.com/edit/react-redux-crud-todo)

[Demo - Pagination](https://stackblitz.com/edit/react-redux-crud-pagination)

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

// The left hand's keys are specified.
// You can define the action you need only
export enum TodoActionTypes {
  CREATE = 'CREATE_TODO',
  DELETE = 'DELETE_TODO',
  UPDATE = 'UPDATE_TODO',
  RESET = 'RESET_TODOS',
  PAGINATE = 'PAGINATE_TODO',
  SET_PAGE = 'SET_PAGE_TODO',
  SET_SEARCH = 'SET_SEARCH_TODO',
  FORCE_UPDATE = 'FORCE_UPDATE_TODO',
}

const crudActionsCreator = getCRUDActionCreator<
  typeof TodoActionTypes,
  Schema$Todo,
  'uniqueID'
>();

// Same as above, you can define the action you need only
export const todoActions = {
  createTodo: crudActionsCreator['CREATE'],
  deleteTodo: crudActionsCreator['DELETE'],
  updateTodo: crudActionsCreator['UPDATE'],
  resetTodos: crudActionsCreator['RESET'],
  paginateTodo: crudActionsCreator['PAGINATE'],
  setPageTodo: crudActionsCreator['SET_PAGE'],
  setSearchTodo: crudActionsCreator['SET_SEARCH'],
  forceUpdateTodo: crudActionsCreator['FORCE_UPDATE'],
};
```

`/store/reducer.ts`

```ts
import { combineReducers, Reducer, AnyAction } from 'redux';
import { createCRUDReducer } from '@pong420/redux-crud';
import { Schema$Todo } from '../typings';

const [todoInitialState, todoReducer] = createCRUDReducer<Schema$Todo>({
  key: 'uniqueID',
  actions: TodoActionTypes,
});

const rootReducer = () =>
  combineReducers({
    todo: todoReducer,
  });

export default rootReducer;

export type RootState = ReturnType<ReturnType<typeof rootReducer>>;
```

## URL Search Params

By default, the initial state will initialize `pageNo` and `search` from URL search params. See

[Examples - Handle pageNo or filter on URL search param](src/examples/URLSearchParams)

To disable this feature, you could

```ts
const [state, reducer] = createCRUDReducer({
  // ...other otpions
  disableSearchParams: true,
});
```

## TODO

[ ] Add Docs
[ ] Add Unit Test
