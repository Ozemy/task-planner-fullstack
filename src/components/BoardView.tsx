import type { Category, SortId, Task, TaskStatus } from '../types/planner';
import { sortTasks } from '../utils/task';
import { TaskCard } from './TaskCard';

interface BoardViewProps {
  tasks: Task[];
  categories: Category[];
  sortBy: SortId;
  onEdit: (task: Task) => void;
  onFocusTask: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'active', label: 'Активные' },
  { status: 'overdue', label: 'Просроченные' },
  { status: 'completed', label: 'Выполненные' },
];

export function BoardView(props: BoardViewProps) {
  const { tasks, categories, sortBy } = props;

  return (
    <section className="board-view">
      {COLUMNS.map((column) => {
        const columnTasks = sortTasks(
          tasks.filter((task) => task.status === column.status),
          sortBy,
        );
        return (
          <div key={column.status} className="board-column">
            <header>
              <h2>{column.label}</h2>
              <span>{columnTasks.length}</span>
            </header>
            <div>
              {columnTasks.length === 0 ? (
                <p className="column-empty">Нет задач</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categories.find((category) => category.id === task.categoryId)}
                    {...props}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
