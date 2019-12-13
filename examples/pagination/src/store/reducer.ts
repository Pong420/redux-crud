import { combineReducers, Reducer, AnyAction } from 'redux';
import { createCRUDReducer } from '@pong420/redux-crud';
import { UserActionTypes } from '../actions';
import { Schema$User } from '../fakeApi';

const { crudReducer: userReducer } = createCRUDReducer<Schema$User, 'id'>({
  key: 'id',
  actions: UserActionTypes,
});

const rootReducer = () =>
  combineReducers({
    user: userReducer,
  });

export default rootReducer;

export type RootState = ReturnType<ReturnType<typeof rootReducer>>;
