import { Schema$User } from "../fakeApi";
import { getCRUDActionCreator, UnionCRUDActions } from "@pong420/redux-crud";

export enum UserActionTypes {
  CREATE = "CREATE_USER",
  DELETE = "DELETE_USER",
  UPDATE = "UPDATE_USER",
  RESET = "RESET_USERS",
  PAGINATE = "PAGINATE_USER",
  SET_PAGE = "SET_PAGE_USER"
}

const crudActionsCreator = getCRUDActionCreator<
  typeof UserActionTypes,
  Schema$User,
  "id"
>();

export const userActions = {
  createUser: crudActionsCreator["CREATE"](UserActionTypes.CREATE),
  deleteUser: crudActionsCreator["DELETE"](UserActionTypes.DELETE),
  updateUser: crudActionsCreator["UPDATE"](UserActionTypes.UPDATE),
  resetUsers: crudActionsCreator["RESET"](UserActionTypes.RESET),
  paginateUser: crudActionsCreator["PAGINATE"](UserActionTypes.PAGINATE),
  setPageUser: crudActionsCreator["SET_PAGE"](UserActionTypes.SET_PAGE)
};