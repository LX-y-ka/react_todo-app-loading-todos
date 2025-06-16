import React from 'react';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  onCheck: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
};

export const TodoInfo: React.FC<Props> = React.memo(
  ({ todo, onCheck, onDelete }) => {
    return (
      <div
        data-cy="Todo"
        className={`todo ${todo.completed ? 'completed' : ''}`}
      >
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className="todo__status-label">
          <input
            name="checkbox"
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={todo.completed}
            onChange={() => onCheck(todo.id, !todo.completed)}
          />
        </label>

        <span data-cy="TodoTitle" className="todo__title">
          {todo.title}
        </span>

        {/* Remove button appears only on hover */}
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(todo.id)}
        >
          ×
        </button>

        {/* overlay will cover the todo while it is being deleted or updated */}
        <div data-cy="TodoLoader" className={`modal overlay`}>
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      </div>
    );
  },
);

TodoInfo.displayName = 'TodoInfo';
