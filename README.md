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
  setParamsTodo: ['SET_PARAMS', 'SET_PARAMS_TODO'],
  foreUpdateTodo: ['FORCE_UPDATE', 'FORCE_UPDATE_TODO'],
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

By default, the initial state will initialize `pageNo` and `params` from URL search params. See

[Examples - Handle pageNo or filter on URL search params](src/examples/URLParamsParams)

To disable this feature, you could

```ts
const [state, reducer] = createCRUDReducer({
  // ...other otpions
  disableParamsParams: true
});
```

## TODO

- [ ] Add Docs
- [ ] Add Unit Test
