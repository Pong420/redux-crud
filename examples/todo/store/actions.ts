import { Schema$Todo } from '../typings';
import {
  getCRUDActionCreator,
  UnionCRUDActions,
} from '../../../src/createCRUDActions';

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
