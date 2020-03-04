import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { createCRUDActions } from '../createCRUDActions';
import { createCRUDReducer } from '../createCRUDReducer';

export const history = createBrowserHistory();

export interface Schema$Todo {
  id: string;
  task: string;
  completed: boolean;
}

export const [todoActions, TodoActionTypes] = createCRUDActions<
  Schema$Todo,
  'id'
>()({
  createTodo: ['CREATE', 'CREATE_TODO'],
  deleteTodo: ['DELETE', 'DELETE_TODO'],
  updateTodo: ['UPDATE', 'UPDATE_TODO'],
  resetTodo: ['RESET', 'RESET_TODO']
});

export const [, todoReducer] = createCRUDReducer<Schema$Todo>({
  key: 'id',
  actions: TodoActionTypes
});

export const [s, prefillReducer] = createCRUDReducer<Schema$Todo>({
  key: 'id',
  actions: TodoActionTypes,
  prefill: false
});

const createRootReducer = (history: Parameters<typeof connectRouter>[0]) =>
  combineReducers({
    router: connectRouter(history),
    todo: todoReducer,
    prefill: prefillReducer
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export function configureStore() {
  const enhancer = compose(applyMiddleware(routerMiddleware(history)));

  const store = createStore(createRootReducer(history), undefined, enhancer);

  return store;
}
