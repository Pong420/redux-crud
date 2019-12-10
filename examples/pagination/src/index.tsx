import React, { useCallback, useMemo } from "react";
import { render } from "react-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { useRxAsync } from "use-rx-async";
import { Column } from "react-table";
import { ButtonGroup, Button } from "@blueprintjs/core";
import { Table } from "./Table";
import { configureStore, userPaginationSelector, userActions } from "./store";
import { api, Schema$User } from "./fakeApi";

import "./style.css";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

const store = configureStore();

type PromiseArgs<T> = T extends PromiseLike<infer U> ? U : T;
type Result = PromiseArgs<ReturnType<typeof api>>;

const columns: Column<Partial<Schema$User>>[] = [
  {
    Header: "Index",
    accessor: "index"
  },
  {
    Header: "Username",
    accessor: "username"
  },
  { Header: "Email", accessor: "email" }
];

function App() {
  const { data, defer, pageNo, pageSize, total } = useSelector(
    userPaginationSelector
  );
  const dispatch = useDispatch();

  const request = useCallback(() => api({ pageNo, pageSize }), [
    pageNo,
    pageSize
  ]);

  const { paginateUser, setPageNo } = useMemo(() => {
    const paginateUser = ({ data, total, pageNo }: Result) =>
      dispatch(userActions.paginateUser({ data, total, pageNo }));

    const setPageNo = (pageNo: number) =>
      dispatch(userActions.setPageUser(pageNo));

    return { paginateUser, setPageNo };
  }, [dispatch]);

  const { loading } = useRxAsync(request, { defer, onSuccess: paginateUser });

  return (
    <div>
      <Table data={data} columns={columns} />
      <ButtonGroup>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, index) => (
          <Button
            text={index + 1}
            intent={pageNo === index + 1 ? "primary" : undefined}
            onClick={() => setPageNo(index + 1)}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
