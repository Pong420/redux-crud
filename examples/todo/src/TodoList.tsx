import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { todoIdsSelector, todoSelector, todoActions } from "./store";
import { UUID } from "./uuid";

const Todo = React.memo<{ id: string }>(({ id }) => {
  const { task, completed } = useSelector(todoSelector(id));
  const dispatch = useDispatch();

  const toggleCompeleted = () =>
    dispatch(todoActions.updateTodo({ uniqueID: id, completed: !completed }));

  const deleteTask = () => dispatch(todoActions.deleteTodo({ uniqueID: id }));

  return (
    <tr>
      <td className={`todo ${completed ? "completed" : ""}`.trim()}>{task}</td>
      <td>
        <button onClick={toggleCompeleted}>
          {completed ? "Undo" : "Done"}
        </button>
        <button onClick={deleteTask}>Delete</button>
      </td>
    </tr>
  );
});

const uuid = new UUID();

export const TodoList = React.memo(() => {
  const inputRef = useRef<HTMLInputElement>(null);

  const todos = useSelector(todoIdsSelector);
  const dispatch = useDispatch();

  const addTodo = (task: string) =>
    dispatch(
      todoActions.createTodo({
        uniqueID: uuid.next(),
        completed: false,
        task
      })
    );

  return (
    <div>
      <form
        onSubmit={event => {
          event.preventDefault();
          addTodo(inputRef.current!.value);
          inputRef.current!.value = "";
        }}
      >
        <input placeholder="todo ..." ref={inputRef} />
        <button type="submit" children="Add" />
      </form>
      <h4 style={{ marginBottom: "10px" }}>TODOS</h4>
      <div>(Click on the task to change its status)</div>
      <table>
        {todos.map(id => (
          <Todo id={id} key={id} />
        ))}
      </table>
    </div>
  );
});
