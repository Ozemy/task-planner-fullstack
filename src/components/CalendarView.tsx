import { useMemo, useState } from 'react';
import type { Category, SortId, Task } from '../types/planner';
import {
  getMonthLabel,
  getVisibleMonthGridDays,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  monthHasVisibleDates,
  shiftMonth,
  toDateInputValue,
} from '../utils/date';
import { sortTasks } from '../utils/task';
import { PlusIcon } from './Icons';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  sortBy: SortId;
  onCreateForDate: (date: string) => void;
  onEdit: (task: Task) => void;
  onFocusTask: (taskId: string) => void;
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function CalendarView({
  tasks,
  categories,
  sortBy,
  onCreateForDate,
  onEdit,
  onFocusTask,
}: CalendarViewProps) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const today = new Date();
  const todayValue = toDateInputValue(today);
  const days = getVisibleMonthGridDays(displayMonth, today);
  const isShowingCurrentMonth = isSameMonth(displayMonth, today);
  const previousMonth = shiftMonth(displayMonth, -1);
  const canShowPreviousMonth = monthHasVisibleDates(previousMonth, today);
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (!task.dueDate || task.dueDate < todayValue) {
        return;
      }

      const dayTasks = grouped.get(task.dueDate) ?? [];
      dayTasks.push(task);
      grouped.set(task.dueDate, dayTasks);
    });
    return grouped;
  }, [tasks, todayValue]);

  return (
    <section className="calendar-view" aria-label="Календарь задач">
      <header className="calendar-toolbar">
        <div>
          <p>Календарь</p>
          <h2>{getMonthLabel(displayMonth)}</h2>
        </div>
        <div className="calendar-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={isShowingCurrentMonth}
            title={isShowingCurrentMonth ? 'Уже показан текущий месяц' : 'Перейти к текущему месяцу'}
            aria-label={
              isShowingCurrentMonth ? 'Текущий месяц уже открыт' : 'Перейти к текущему месяцу'
            }
            onClick={() => setDisplayMonth(new Date())}
          >
            Сегодня
          </button>
          <button
            type="button"
            className="icon-button"
            disabled={!canShowPreviousMonth}
            aria-label={
              canShowPreviousMonth
                ? 'Предыдущий месяц'
                : 'Предыдущий месяц недоступен: там только прошедшие даты'
            }
            title={
              canShowPreviousMonth
                ? 'Предыдущий месяц'
                : 'Предыдущий месяц недоступен: там только прошедшие даты'
            }
            onClick={() => setDisplayMonth((current) => shiftMonth(current, -1))}
          >
            ←
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Следующий месяц"
            onClick={() => setDisplayMonth((current) => shiftMonth(current, 1))}
          >
            →
          </button>
        </div>
      </header>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`placeholder-${index}`} className="calendar-day is-placeholder" />;
          }

          const dateValue = toDateInputValue(day);
          const dayTasks = sortTasks(tasksByDate.get(dateValue) ?? [], sortBy);
          const visibleTasks = dayTasks.slice(0, 3);
          const isCurrentMonth = day.getMonth() === displayMonth.getMonth();
          const isToday = isSameDay(day, today);
          const isPastDay = isBeforeDay(day, today);

          return (
            <article
              key={dateValue}
              className={[
                'calendar-day',
                isCurrentMonth ? '' : 'is-outside',
                isToday ? 'is-today' : '',
                isPastDay ? 'is-past' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <header>
                <span>{day.getDate()}</span>
                <button
                  type="button"
                  aria-label={`Создать задачу на ${dateValue}`}
                  title="Создать задачу"
                  disabled={isPastDay}
                  onClick={() => onCreateForDate(dateValue)}
                >
                  <PlusIcon size={15} />
                </button>
              </header>

              <div className="calendar-day-tasks">
                {visibleTasks.map((task) => {
                  const category = categories.find((item) => item.id === task.categoryId);
                  return (
                    <div key={task.id} className="calendar-task-row">
                      <button
                        type="button"
                        className={[
                          'calendar-task',
                          `priority-${task.priority}`,
                          task.status === 'overdue' ? 'status-overdue' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => onEdit(task)}
                        title={`${task.title}${category ? ` · ${category.name}` : ''}`}
                      >
                        {task.title}
                      </button>
                      {task.status !== 'completed' && (
                        <button
                          type="button"
                          className="calendar-focus-button"
                          onClick={() => onFocusTask(task.id)}
                          aria-label={`Начать фокус по задаче ${task.title}`}
                          title="Начать фокус"
                        >
                          Фокус
                        </button>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length > visibleTasks.length && (
                  <span className="calendar-more">+{dayTasks.length - visibleTasks.length} ещё</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
