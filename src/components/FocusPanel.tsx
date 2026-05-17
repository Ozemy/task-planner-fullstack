import type { FilterId, Task } from '../types/planner';
import { formatDateTime, getDeadline, isTaskDueToday } from '../utils/date';

interface FocusPanelProps {
  tasks: Task[];
  onNavigateToFilter: (filterId: FilterId) => void;
  onCreateTask: () => void;
}

export function FocusPanel({ tasks, onNavigateToFilter, onCreateTask }: FocusPanelProps) {
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const overdueCount = tasks.filter((task) => task.status === 'overdue').length;
  const todayTasks = tasks
    .filter((task) => task.status !== 'completed' && isTaskDueToday(task))
    .sort(compareDeadlines);
  const nearestTask =
    todayTasks[0] ??
    tasks
      .filter((task) => task.status !== 'completed' && getDeadline(task))
      .sort(compareDeadlines)[0];
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <section className="focus-panel" aria-label="Сегодня в фокусе">
      <div className="focus-summary">
        <p>Сегодня в фокусе</p>
        <h2>{nearestTask ? nearestTask.title : 'Свободное окно для новой задачи'}</h2>
        <span>
          {nearestTask
            ? formatDateTime(nearestTask)
            : 'Добавьте задачу с дедлайном, чтобы панель начала помогать с приоритетами.'}
        </span>
      </div>

      <div className="focus-metrics">
        <div>
          <strong>{overdueCount}</strong>
          <span>Просрочено</span>
        </div>
        <div>
          <strong>
            {completedCount}/{tasks.length}
          </strong>
          <span>Выполнено</span>
        </div>
        <div>
          <strong>{progress}%</strong>
          <span>Прогресс</span>
        </div>
      </div>

      <div className="focus-actions">
        <button type="button" className="secondary-button" onClick={() => onNavigateToFilter('today')}>
          Сегодня
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigateToFilter('overdue')}
        >
          Просроченные
        </button>
        <button type="button" className="primary-button" onClick={onCreateTask}>
          Создать задачу
        </button>
      </div>
    </section>
  );
}

function compareDeadlines(left: Task, right: Task): number {
  const leftDeadline = getDeadline(left)?.getTime() ?? Number.POSITIVE_INFINITY;
  const rightDeadline = getDeadline(right)?.getTime() ?? Number.POSITIVE_INFINITY;
  return leftDeadline - rightDeadline;
}
