import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { configureStore, todoActions } from "./store";
import { TodoList } from "./TodoList";
import { Schema$Todo } from "./typings";
import "./style.css";

const store = configureStore();

// The easier and safer way to set initial value
const todos: Schema$Todo[] = [
  { uniqueID: "q", task: "Task 1", completed: false },
  { uniqueID: "w", task: "Task 2", completed: false },
  { uniqueID: "e", task: "Task 3", completed: false }
];
todos.forEach(todo => {
  store.dispatch(todoActions.createTodo(todo));
});

function App() {
  return <TodoList />;
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
