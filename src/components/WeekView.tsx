import type { Category, SortId, Task } from '../types/planner';
import {
  getDayLabel,
  getVisibleWeekDays,
  isBeforeDay,
  toDateInputValue,
} from '../utils/date';
import { sortTasks } from '../utils/task';
import { TaskCard } from './TaskCard';

interface WeekViewProps {
  tasks: Task[];
  categories: Category[];
  sortBy: SortId;
  onEdit: (task: Task) => void;
  onFocusTask: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function WeekView(props: WeekViewProps) {
  const { tasks, categories, sortBy } = props;
  const weekDays = getVisibleWeekDays();
  const weekDateKeys = new Set(weekDays.map((day) => toDateInputValue(day)));
  const today = new Date();
  const withoutDeadline = tasks.filter((task) => !task.dueDate);
  const outsideCurrentWeek = tasks.filter(
    (task) =>
      task.dueDate &&
      !weekDateKeys.has(task.dueDate) &&
      !isBeforeDay(new Date(`${task.dueDate}T12:00`), today),
  );

  return (
    <section className="week-view">
      {weekDays.map((day) => {
        const dateKey = toDateInputValue(day);
        const dayTasks = sortTasks(
          tasks.filter((task) => task.dueDate === dateKey),
          sortBy,
        );
        return (
          <div key={dateKey} className="week-day">
            <header>
              <h2>{getDayLabel(day)}</h2>
              <span>{dayTasks.length}</span>
            </header>
            {dayTasks.length === 0 ? (
              <p className="column-empty">Свободно</p>
            ) : (
              dayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories.find((category) => category.id === task.categoryId)}
                  {...props}
                />
              ))
            )}
          </div>
        );
      })}

      {withoutDeadline.length > 0 && (
        <div className="week-day undated">
          <header>
            <h2>Без дедлайна</h2>
            <span>{withoutDeadline.length}</span>
          </header>
          {sortTasks(withoutDeadline, sortBy).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              {...props}
            />
          ))}
        </div>
      )}

      {outsideCurrentWeek.length > 0 && (
        <div className="week-day undated">
          <header>
            <h2>Вне текущей недели</h2>
            <span>{outsideCurrentWeek.length}</span>
          </header>
          {sortTasks(outsideCurrentWeek, sortBy).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              {...props}
            />
          ))}
        </div>
      )}
    </section>
  );
}
