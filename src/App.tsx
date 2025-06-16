/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList/TodoList';

enum FILTERS {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

const ERROR_MESSAGES = {
  LOAD_TODOS: 'Unable to load todos',
  ADD_TODO: 'Unable to add a todo',
  DELETE_TODO: 'Unable to delete a todo',
  UPDATE_TODO: 'Unable to update a todo',
  EMPTY_TITLE: 'Title should not be empty',
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtredField, setFiltredField] = useState<FILTERS>(FILTERS.ALL); //є в залежності filtredTodos
  const [completedCount, setCompletedCount] = useState(0); //при зміні може зникати чи з'являтися кнопка 'Clear completed'
  const [error, setError] = useState<string | null>(null); //впливає на відображення помилок
  const [title, setTitle] = useState(''); //від нього залежить значення у полі input яке повинно ставати пустим після додавання
  const inputRef = useRef<HTMLInputElement>(null);

  const filtredTodos = useMemo(() => {
    let filtered: Todo[];

    switch (filtredField) {
      case FILTERS.ALL:
        filtered = todos;
        break;

      case FILTERS.ACTIVE:
        filtered = todos.filter(t => !t.completed);
        break;

      case FILTERS.COMPLETED:
        filtered = todos.filter(t => t.completed);
        break;

      default:
        filtered = todos;
    }

    return filtered;
  }, [todos, filtredField]);

  const showError = (message: string) => {
    setError(message);

    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    getTodos()
      .then(result => {
        setTodos(result);
        setCompletedCount(result.filter(t => t.completed).length);
      })
      .catch(() => showError(ERROR_MESSAGES.LOAD_TODOS));
  }, []);

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const deleteErrors = () => {
    setError(null);
  };

  const onFiltr = (field: FILTERS) => {
    if (field === filtredField) {
      return;
    }

    setFiltredField(field);
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim()) {
      setLoading(false);
      setTitle('');
      showError(ERROR_MESSAGES.EMPTY_TITLE);

      return;
    }

    const newTodo = {
      title: title.trim(),
      userId: USER_ID,
      completed: false,
    };

    addTodo(newTodo)
      .then(result => setTodos(prev => [...prev, result]))
      .catch(() => {
        showError(ERROR_MESSAGES.ADD_TODO);
      })
      .finally(() => {
        setLoading(false);
        setTitle('');
      });
  };

  const handleDelete = (todoId: number) => {
    const isMinCompleted = todos.find(t => t.id === todoId)?.completed;

    deleteTodo(todoId)
      .then(() => {
        setTodos(items => items.filter(i => i.id !== todoId));
        if (isMinCompleted) {
          setCompletedCount(prev => prev - 1);
        }
      })
      .catch(() => {
        setError(ERROR_MESSAGES.DELETE_TODO);
      });
  };

  const deleteCompleted = () => {
    todos.forEach(t => {
      if (t.completed) {
        handleDelete(t.id);
      }
    });
  };

  const handleUpdate = (todoId: number, completed: boolean) => {
    updateTodo(todoId, completed)
      .then(() => {
        setTodos(todosList =>
          todosList.map(t => {
            if (t.id === todoId) {
              return { ...t, completed: completed };
            }

            if (completed) {
              setCompletedCount(prev => prev + 1);
            } else {
              setCompletedCount(prev => prev - 1);
            }

            return t;
          }),
        );
      })
      .catch(() => showError(ERROR_MESSAGES.UPDATE_TODO));
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={`todoapp__toggle-all ${completedCount === todos.length ? 'active' : ''}`}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleAdd}>
            <input
              ref={inputRef}
              value={title}
              name="title"
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
            />
          </form>
        </header>
        <TodoList
          todos={filtredTodos}
          onCheck={handleUpdate}
          onDelete={handleDelete}
        />

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${todos.filter(t => !t.completed).length} items left`}
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filtredField === FILTERS.ALL ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => onFiltr(FILTERS.ALL)}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filtredField === FILTERS.ACTIVE ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => onFiltr(FILTERS.ACTIVE)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filtredField === FILTERS.COMPLETED ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => onFiltr(FILTERS.COMPLETED)}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            {completedCount > 0 && (
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                onClick={() => deleteCompleted()}
              >
                Clear completed
              </button>
            )}
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${!error ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => deleteErrors()}
        />
        {/* show only one message at a time */}
        {error}
      </div>
    </div>
  );
};
