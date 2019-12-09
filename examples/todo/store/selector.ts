import { RootState } from "./reducer";

export const todoIdsSelector = (state: RootState) => state.todo.ids;

export const todoSelector = (id: string) => (state: RootState) =>
  state.todo.byIds[id];
