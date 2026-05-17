import { useState } from 'react';
import type { FilterId, Task } from '../types/planner';
import { formatDateTime } from '../utils/date';
import { buildSmartPlanner } from '../utils/smartPlanner';

interface SmartPlannerProps {
  tasks: Task[];
  onNavigateToFilter: (filterId: FilterId) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onStartFocus: (taskId: string) => void;
  onCreateTask: () => void;
  onOpenCalendar: () => void;
}

const WORKLOAD_LABELS = {
  low: 'Нагрузка низкая',
  medium: 'Нагрузка средняя',
  high: 'Нагрузка высокая',
};

export function SmartPlanner({
  tasks,
  onNavigateToFilter,
  onEditTask,
  onCompleteTask,
  onStartFocus,
  onCreateTask,
  onOpenCalendar,
}: SmartPlannerProps) {
  const planner = buildSmartPlanner(tasks);
  const [isExpanded, setIsExpanded] = useState(false);
  const visiblePlan = isExpanded ? planner.todayPlan : planner.todayPlan.slice(0, 3);
  const hasMoreRecommendations = planner.todayPlan.length > 3;

  return (
    <section className="smart-planner" aria-label="Умный планировщик дня">
      <div className="smart-planner-header">
        <div>
          <p>Smart Planner</p>
          <h2>Умный планировщик дня</h2>
        </div>
        <span className={`workload-badge is-${planner.workloadLevel}`}>
          {WORKLOAD_LABELS[planner.workloadLevel]}
        </span>
      </div>

      <p className="smart-planner-copy">{planner.recommendationText}</p>

      <div className="smart-metrics" aria-label="Показатели плана">
        <div>
          <strong>{planner.overdueCount}</strong>
          <span>Просрочено</span>
        </div>
        <div>
          <strong>{planner.highPriorityCount}</strong>
          <span>Высокий приоритет</span>
        </div>
        <div>
          <strong>{planner.todayCount}</strong>
          <span>На сегодня</span>
        </div>
        <div>
          <strong>{planner.undatedCount}</strong>
          <span>Без дедлайна</span>
        </div>
      </div>

      {planner.topTask ? (
        <div className="smart-top-task">
          <span>Главная задача дня</span>
          <button
            type="button"
            className="smart-top-task-title"
            onClick={() => onEditTask(planner.topTask!.task)}
          >
            {planner.topTask.task.title}
          </button>
          <small>
            {planner.topTask.reason} · {formatDateTime(planner.topTask.task)}
          </small>
          <div className="smart-top-task-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => onEditTask(planner.topTask!.task)}
            >
              Открыть
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => onCompleteTask(planner.topTask!.task.id)}
              aria-label={`Отметить выполненной задачу ${planner.topTask.task.title}`}
            >
              Выполнено
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onStartFocus(planner.topTask!.task.id)}
            >
              Начать фокус
            </button>
          </div>
        </div>
      ) : (
        <div className="smart-empty">
          <strong>План свободен</strong>
          <span>Создайте задачу, чтобы получить автоматическую приоритизацию дня.</span>
        </div>
      )}

      <div className="smart-plan-block">
        <div className="smart-subheading">
          <h3>План на сегодня</h3>
          <span>Почему эта задача?</span>
        </div>

        {planner.todayPlan.length > 0 ? (
          <ol className="smart-plan-list">
            {visiblePlan.map(({ task, reason }) => (
              <li key={task.id}>
                <button
                  type="button"
                  className="smart-task-button"
                  onClick={() => onEditTask(task)}
                  aria-label={`Открыть задачу ${task.title}`}
                >
                  <strong>{task.title}</strong>
                  <span>{reason}</span>
                  <em>Открыть</em>
                </button>
                <button
                  type="button"
                  className="smart-complete-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCompleteTask(task.id);
                  }}
                  aria-label={`Отметить выполненной задачу ${task.title}`}
                >
                  Выполнено
                </button>
                <button
                  type="button"
                  className="smart-focus-button"
                  onClick={() => onStartFocus(task.id)}
                  aria-label={`Начать фокус по задаче ${task.title}`}
                >
                  Фокус
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="smart-plan-empty">Нет активных задач для рекомендаций.</p>
        )}

        {hasMoreRecommendations && (
          <button
            type="button"
            className="text-button smart-plan-toggle"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Свернуть' : 'Показать ещё'}
          </button>
        )}
      </div>

      {planner.suggestedActions.length > 0 && (
        <ul className="smart-suggestions">
          {planner.suggestedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      )}

      <div className="smart-actions">
        <button type="button" className="secondary-button" onClick={() => onNavigateToFilter('today')}>
          Показать задачи на сегодня
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigateToFilter('overdue')}
        >
          Показать просроченные
        </button>
        <button type="button" className="primary-button" onClick={onCreateTask}>
          Создать задачу
        </button>
        <button type="button" className="secondary-button" onClick={onOpenCalendar}>
          Перейти в календарь
        </button>
      </div>
    </section>
  );
}
