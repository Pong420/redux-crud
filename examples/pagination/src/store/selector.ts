import { RootState } from "./reducer";
import { paginationSelector } from "@pong420/redux-crud";

export const userPaginationSelector = (state: RootState) =>
  paginationSelector(state.user);
