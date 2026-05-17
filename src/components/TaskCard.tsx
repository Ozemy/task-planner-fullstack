import type { Category, Task } from '../types/planner';
import { formatDateTime } from '../utils/date';
import { getPriorityLabel, getTaskStatusLabel } from '../utils/task';
import { CheckCircleIcon, CircleIcon, PencilIcon, TrashIcon, UndoIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onEdit: (task: Task) => void;
  onFocusTask: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({
  task,
  category,
  onEdit,
  onFocusTask,
  onDelete,
  onToggleComplete,
  onToggleSubtask,
}: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;

  return (
    <article className={`task-card priority-${task.priority} status-${task.status}`}>
      <div className="task-card-header">
        <button
          type="button"
          className="completion-button"
          onClick={() => onToggleComplete(task.id)}
          title={task.status === 'completed' ? 'Восстановить задачу' : 'Отметить выполненной'}
          aria-label={task.status === 'completed' ? 'Восстановить задачу' : 'Отметить выполненной'}
        >
          {task.status === 'completed' ? <CheckCircleIcon size={22} /> : <CircleIcon size={22} />}
        </button>

        <div className="task-title-block">
          <h3>{task.title}</h3>
          <div className="task-meta">
            <span>{getTaskStatusLabel(task.status)}</span>
            <span>{getPriorityLabel(task.priority)}</span>
            <span>{category?.name ?? 'Без категории'}</span>
          </div>
        </div>

        <div className="task-actions">
          {task.status !== 'completed' && (
            <button
              type="button"
              className="task-focus-button"
              onClick={() => onFocusTask(task.id)}
              title="Начать фокус по задаче"
              aria-label={`Начать фокус по задаче ${task.title}`}
            >
              Фокус
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Редактировать задачу"
            aria-label={`Редактировать задачу ${task.title}`}
          >
            <PencilIcon size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Удалить задачу"
            aria-label={`Удалить задачу ${task.title}`}
          >
            <TrashIcon size={17} />
          </button>
        </div>
      </div>

      {task.description && <p>{task.description}</p>}

      <div className="task-footer">
        <span>{formatDateTime(task)}</span>
        <span>
          Создана{' '}
          {new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
          }).format(new Date(task.createdAt))}
        </span>
        <span>
          Изменена{' '}
          {new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'short',
          }).format(new Date(task.updatedAt))}
        </span>
      </div>

      {task.subtasks.length > 0 && (
        <div className="subtask-list">
          <div>
            Подзадачи {completedSubtasks}/{task.subtasks.length}
          </div>
          {task.subtasks.map((subtask) => (
            <label key={subtask.id}>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggleSubtask(task.id, subtask.id)}
              />
              <span>{subtask.title}</span>
            </label>
          ))}
        </div>
      )}

      {task.status === 'completed' && (
        <button type="button" className="restore-link" onClick={() => onToggleComplete(task.id)}>
          <UndoIcon size={15} />
          Восстановить
        </button>
      )}
    </article>
  );
}
