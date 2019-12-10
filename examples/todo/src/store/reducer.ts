import { combineReducers, Reducer, AnyAction } from "redux";
import { createCRUDReducer } from "@pong420/redux-crud";
import { Schema$Todo } from "../typings";

const { crudReducer: todoReducer } = createCRUDReducer<Schema$Todo, "uniqueID">(
  {
    key: "uniqueID"
  }
);

const rootReducer = () =>
  combineReducers({
    todo: todoReducer
  });

export default rootReducer;

export type RootState = ReturnType<ReturnType<typeof rootReducer>>;
