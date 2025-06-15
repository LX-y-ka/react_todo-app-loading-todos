import { Todo } from '../../types/Todo';
import { TodoInfo } from '../TodoInfo/TodoInfo';

type Props = {
  todos: Todo[];
  onCheck: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
};

export const TodoList: React.FC<Props> = ({ todos, onCheck, onDelete }) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {/* This is a completed todo */}
      {todos.map(t => (
        <TodoInfo key={t.id} todo={t} onCheck={onCheck} onDelete={onDelete} />
      ))}
    </section>
  );
};
