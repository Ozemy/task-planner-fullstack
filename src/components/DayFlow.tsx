import { useMemo, useState } from 'react';
import type { FilterId, Task } from '../types/planner';
import { formatDateTime, getDeadline, isTaskDueToday } from '../utils/date';

interface DayFlowProps {
  tasks: Task[];
  focusTask: Task | null;
  onNavigateToFilter: (filterId: FilterId) => void;
  onOpenCalendar: () => void;
  onEditTask: (task: Task) => void;
}

const DEFAULT_VISIBLE_ITEMS = 4;

export function DayFlow({
  tasks,
  focusTask,
  onNavigateToFilter,
  onOpenCalendar,
  onEditTask,
}: DayFlowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const todayTasks = useMemo(
    () => tasks.filter((task) => isTaskDueToday(task)).sort(compareDeadlines),
    [tasks],
  );
  const activeTodayTasks = todayTasks.filter((task) => task.status !== 'completed');
  const overdueCount = tasks.filter((task) => task.status === 'overdue').length;
  const completedToday = todayTasks.filter((task) => task.status === 'completed').length;
  const progress =
    todayTasks.length === 0 ? 0 : Math.round((completedToday / todayTasks.length) * 100);
  const visibleTasks = isExpanded
    ? activeTodayTasks
    : activeTodayTasks.slice(0, DEFAULT_VISIBLE_ITEMS);
  const hasMoreTasks = activeTodayTasks.length > DEFAULT_VISIBLE_ITEMS;

  return (
    <section className="day-flow" aria-label="Пульс дня">
      <div className="day-flow-header">
        <div>
          <p>Пульс дня</p>
          <h2>
            {completedToday}/{todayTasks.length} выполнено сегодня
          </h2>
        </div>
        <strong>{progress}%</strong>
      </div>

      <div className="day-flow-progress" aria-label={`Прогресс дня ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {focusTask && (
        <button type="button" className="day-flow-focus" onClick={() => onEditTask(focusTask)}>
          <span>Текущий фокус</span>
          <strong>{focusTask.title}</strong>
        </button>
      )}

      {overdueCount > 0 && (
        <p className="day-flow-alert">
          Просрочено задач: <strong>{overdueCount}</strong>
        </p>
      )}

      {activeTodayTasks.length > 0 ? (
        <div className="day-flow-timeline">
          {visibleTasks.map((task) => (
            <button
              type="button"
              key={task.id}
              className="day-flow-item"
              onClick={() => onEditTask(task)}
            >
              <span>{task.dueTime || 'Без времени'}</span>
              <strong>{task.title}</strong>
              <small>{formatDateTime(task)}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="day-flow-empty">
          На сегодня нет задач. Можно запланировать одну задачу или открыть календарь.
        </p>
      )}

      {hasMoreTasks && (
        <button
          type="button"
          className="text-button day-flow-toggle"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Свернуть' : 'Показать ещё'}
        </button>
      )}

      <div className="day-flow-actions">
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
        <button type="button" className="secondary-button" onClick={onOpenCalendar}>
          Календарь
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
