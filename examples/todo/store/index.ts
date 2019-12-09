import { createStore, applyMiddleware, compose } from "redux";
import createRootReducer from "./reducer";

export * from "./actions";
export * from "./reducer";
export * from "./selector";

export function configureStore() {
  const store = createStore(createRootReducer());
  return store;
}
