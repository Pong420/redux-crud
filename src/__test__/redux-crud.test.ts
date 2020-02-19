import { Store } from 'redux';
import { configureStore, RootState, todoActions } from './store';

let store: Store<RootState>;

beforeAll(() => {
  store = configureStore();
  window.location.pathname = '/';
});

describe('Basic', () => {
  it('should be defined', () => {
    expect(store).toBeDefined();
    expect(store.getState().todo).toBeDefined();
  });

  const newTodo = {
    id: 'q',
    task: 'Task 1',
    completed: false
  };

  it('new todo should be added', () => {
    store.dispatch(todoActions.createTodo(newTodo));
    const { todo } = store.getState();
    expect(todo.pathname).toBe('/');
    expect(todo.ids).toEqual([newTodo.id]);
    expect(todo.list).toEqual([newTodo]);
    expect(todo.byIds).toEqual({ [newTodo.id]: newTodo });
  });

  it('new todo should be updated', () => {
    store.dispatch(todoActions.updateTodo({ id: newTodo.id, completed: true }));
    const { todo } = store.getState();
    expect(todo.byIds[newTodo.id]).toEqual({ ...newTodo, completed: true });
  });

  it('new todo should be deleted', () => {
    store.dispatch(todoActions.deleteTodo({ id: newTodo.id }));
    const { todo } = store.getState();
    expect(todo.ids).toEqual([]);
    expect(todo.list).toEqual([]);
    expect(todo.byIds).toEqual({});
  });

  it('no change if the id is not exists', () => {
    store.dispatch(todoActions.updateTodo({ id: String(Math.random()) }));
    store.dispatch(todoActions.deleteTodo({ id: String(Math.random()) }));
    const { todo } = store.getState();
    expect(todo.ids).toEqual([]);
    expect(todo.list).toEqual([]);
    expect(todo.byIds).toEqual({});
  });

  it('reset', () => {
    const params = { test: 'test' };
    store.dispatch(todoActions.resetTodo({ params }));
    expect(store.getState().todo.params).toEqual(params);
  });
});
