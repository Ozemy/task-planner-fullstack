import type { Task } from '../types/planner';
import { getDeadline, isTaskDueToday } from './date';

export function getSuggestedFocusTask(tasks: Task[]): Task | null {
  const activeTasks = tasks.filter((task) => task.status !== 'completed');

  return (
    getNearestTask(
      activeTasks.filter((task) => task.status === 'overdue' && task.priority === 'high'),
    ) ??
    getNearestTask(
      activeTasks.filter((task) => isTaskDueToday(task) && task.priority === 'high'),
    ) ??
    getNearestTask(activeTasks.filter((task) => getDeadline(task))) ??
    activeTasks.find((task) => task.priority === 'high') ??
    activeTasks[0] ??
    null
  );
}

export interface FocusTaskGroup {
  id: 'overdue' | 'today' | 'upcoming' | 'high' | 'undated';
  label: string;
  tasks: Task[];
}

export function getFocusTaskGroups(tasks: Task[]): FocusTaskGroup[] {
  const activeTasks = tasks.filter((task) => task.status !== 'completed');
  const seen = new Set<string>();
  const groups: FocusTaskGroup[] = [
    {
      id: 'overdue',
      label: 'Просроченные',
      tasks: sortByDeadline(activeTasks.filter((task) => task.status === 'overdue')),
    },
    {
      id: 'today',
      label: 'Сегодня',
      tasks: sortByDeadline(activeTasks.filter((task) => isTaskDueToday(task))),
    },
    {
      id: 'upcoming',
      label: 'Ближайший дедлайн',
      tasks: sortByDeadline(
        activeTasks.filter(
          (task) =>
            task.status !== 'overdue' &&
            !isTaskDueToday(task) &&
            Boolean(getDeadline(task)),
        ),
      ),
    },
    {
      id: 'high',
      label: 'Высокий приоритет',
      tasks: activeTasks.filter((task) => task.priority === 'high' && !task.dueDate),
    },
    {
      id: 'undated',
      label: 'Без дедлайна',
      tasks: activeTasks.filter((task) => !task.dueDate),
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      tasks: group.tasks.filter((task) => {
        if (seen.has(task.id)) {
          return false;
        }

        seen.add(task.id);
        return true;
      }),
    }))
    .filter((group) => group.tasks.length > 0);
}

function getNearestTask(tasks: Task[]): Task | null {
  return sortByDeadline(tasks)[0] ?? null;
}

function sortByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const leftDeadline = getDeadline(left)?.getTime() ?? Number.POSITIVE_INFINITY;
    const rightDeadline = getDeadline(right)?.getTime() ?? Number.POSITIVE_INFINITY;
    return leftDeadline - rightDeadline;
  });
}
