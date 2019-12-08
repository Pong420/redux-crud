## Redux CRUD

`/typings.ts`

```ts
interface Schema$User {
  id: string;
  username: string;
}
```

`/actions/user.ts`

```ts
import { getCRUDActionCreator, UnionCRUDActions } from '../createCRUDActions';
import { Schema$User } from '../typings';

export enum UserActionTypes {
  CREATE = 'CREATE_USER',
  DELETE = 'DELETE_USER',
  UPDATE = 'UPDATE_USER',
  RESET = 'RESET_USERS',
  PAGINATE = 'PAGINATE_USER',
  SET_PAGE = 'SET_PAGE_USER',
}

const crudActionsCreator = getCRUDActionCreator<
  typeof UserActionTypes,
  Schema$User,
  'id'
>();

export const userActions = {
  createUser: crudActionsCreator<'CREATE'>(UserActionTypes.CREATE),
  deleteUser: crudActionsCreator<'DELETE'>(UserActionTypes.DELETE),
  updateUser: crudActionsCreator<'UPDATE'>(UserActionTypes.UPDATE),
  resetUsers: crudActionsCreator<'RESET'>(UserActionTypes.RESET),
  paginateUser: crudActionsCreator<'PAGINATE'>(UserActionTypes.PAGINATE),
  setPageUser: crudActionsCreator<'SET_PAGE'>(UserActionTypes.SET_PAGE),
};
```

`/reducers/user.ts`

```ts
import { UserActions, UserActionTypes } from '../actions/user';
import { createCRUDReducer, CRUDState } from '../createCRUDReducer';
import { Schema$User } from '../typings';

interface State extends CRUDState<Schema$User, 'id'> {}

const { crudInitialState, crudReducer } = createCRUDReducer<Schema$User, 'id'>({
  key: 'id',
});

export default function(state = crudInitialState, action: UserActions): State {
  switch (action.type) {
    case UserActionTypes.RESET:
      return crudReducer(undefined, { type: 'RESET' });

    case UserActionTypes.CREATE:
      return crudReducer(state, { type: 'CREATE', payload: action.payload });

    case UserActionTypes.PAGINATE:
      return crudReducer(state, {
        type: 'PAGINATE',
        payload: action.payload,
      });

    case UserActionTypes.SET_PAGE:
      return crudReducer(state, {
        type: 'SET_PAGE',
        payload: action.payload,
      });

    case UserActionTypes.DELETE:
      return crudReducer(state, { type: 'DELETE', payload: action.payload });

    case UserActionTypes.UPDATE:
      return crudReducer(state, { type: 'UPDATE', payload: action.payload });

    default:
      return state;
  }
}
```
