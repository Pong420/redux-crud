## Redux CRUD

[Demo - Todo Task](https://stackblitz.com/edit/react-redux-crud-todo)

[Demo - Pagination](https://stackblitz.com/edit/react-redux-crud-pagination)

[Example - Extend Redux CRUD](./examples/extend)

## installation

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
import {
  getCRUDActionCreator,
  UnionCRUDActions,
} from '../redux-crud/createCRUDActions';

export enum TodoActionTypes {
  CREATE = 'CREATE_TODO',
  DELETE = 'DELETE_TODO',
  UPDATE = 'UPDATE_TODO',
  RESET = 'RESET_TODOS',
  PAGINATE = 'PAGINATE_TODO',
  SET_PAGE = 'SET_PAGE_TODO',
}

const crudActionsCreator = getCRUDActionCreator<
  typeof TodoActionTypes,
  Schema$Todo,
  'uniqueID'
>();

export const todoActions = {
  createTodo: crudActionsCreator['CREATE'](TodoActionTypes.CREATE),
  deleteTodo: crudActionsCreator['DELETE'](TodoActionTypes.DELETE),
  updateTodo: crudActionsCreator['UPDATE'](TodoActionTypes.UPDATE),
  resetTodos: crudActionsCreator['RESET'](TodoActionTypes.RESET),
  paginateTodo: crudActionsCreator['PAGINATE'](TodoActionTypes.PAGINATE),
  setPageTodo: crudActionsCreator['SET_PAGE'](TodoActionTypes.SET_PAGE),
};
```

`/store/reducer.ts`

```ts
import { combineReducers, Reducer, AnyAction } from 'redux';
import { createCRUDReducer } from '../redux-crud/createCRUDReducer';
import { Schema$Todo } from '../typings';

const { crudReducer: todoReducer } = createCRUDReducer<Schema$Todo, 'uniqueID'>(
  {
    key: 'uniqueID',
    actions: TodoActionTypes,
  }
);

const rootReducer = () =>
  combineReducers({
    todo: todoReducer,
  });

export default rootReducer;

export type RootState = ReturnType<ReturnType<typeof rootReducer>>;
```

Without pass `actions` to createCRUDReducer, you may also handle like this

```ts
const { crudInitialState crudReducer } = createCRUDReducer<Schema$Todo, 'uniqueID'>({
  key: 'uniqueID',
});

function todoReducer(
  state = crudInitialState,
  action: UserActions
) {
  switch (action.type) {
    case TodoActionTypes.RESET:
      return crudReducer(state, action);

    case TodoActionTypes.CREATE:
      return crudReducer(state, action);

    case TodoActionTypes.DELETE:
      return crudReducer(state, action);

    case TodoActionTypes.UPDATE:
      return crudReducer(state, action);

    case TodoActionTypes.PAGINATE:
      return crudReducer(state, action);

    case TodoActionTypes.SET_PAGE:
      return crudReducer(state, action);

    default:
      return state;
  }
}
```

## Note

- `createCRUDReducer` will try to get `pageNo` from url search params as initial value. To disable this feature, you could assign `{ pageNo: 1 }` to `createCRUDReducer`
