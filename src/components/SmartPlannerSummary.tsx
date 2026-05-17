import type { FilterId, Task } from '../types/planner';
import { buildSmartPlanner } from '../utils/smartPlanner';

interface SmartPlannerSummaryProps {
  tasks: Task[];
  onNavigateToFilter: (filterId: FilterId) => void;
  onEditTask: (task: Task) => void;
}

export function SmartPlannerSummary({
  tasks,
  onNavigateToFilter,
  onEditTask,
}: SmartPlannerSummaryProps) {
  const planner = buildSmartPlanner(tasks);

  return (
    <section className="smart-summary" aria-label="Краткий Smart Planner">
      <div>
        <p>Smart Planner</p>
        <h2>{planner.topTask ? planner.topTask.task.title : 'План на сегодня свободен'}</h2>
        <span>{planner.recommendationText}</span>
      </div>

      <div className="smart-summary-actions">
        {planner.topTask && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onEditTask(planner.topTask!.task)}
          >
            Открыть главную задачу
          </button>
        )}
        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigateToFilter(planner.overdueCount > 0 ? 'overdue' : 'today')}
        >
          {planner.overdueCount > 0 ? 'Показать просроченные' : 'Показать задачи на сегодня'}
        </button>
      </div>
    </section>
  );
}
