import type {
  Category,
  FilterId,
  Priority,
  SortId,
  Task,
  TaskDraft,
  TaskStatus,
  ViewMode,
} from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { getDeadline, isTaskDueThisWeek, isTaskDueToday, isTaskOverdue } from './date';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const DEFAULT_CATEGORY: Category = {
  id: UNCATEGORIZED_ID,
  name: 'Без категории',
  color: '#8c8d91',
  createdAt: new Date(0).toISOString(),
};

export function createTask(draft: TaskDraft): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    dueDate: draft.dueDate,
    dueTime: draft.dueTime,
    priority: draft.priority,
    status: 'active',
    categoryId: draft.categoryId || UNCATEGORIZED_ID,
    subtasks: sanitizeSubtasks(draft.subtasks),
    createdAt: now,
    updatedAt: now,
  };

  return withDeadlineStatus(task);
}

export function updateTask(task: Task, draft: TaskDraft): Task {
  return withDeadlineStatus({
    ...task,
    title: draft.title.trim(),
    description: draft.description.trim(),
    dueDate: draft.dueDate,
    dueTime: draft.dueTime,
    priority: draft.priority,
    categoryId: draft.categoryId || UNCATEGORIZED_ID,
    subtasks: sanitizeSubtasks(draft.subtasks),
    updatedAt: new Date().toISOString(),
  });
}

export function toggleTaskCompletion(task: Task): Task {
  const now = new Date().toISOString();
  if (task.status === 'completed') {
    return withDeadlineStatus({
      ...task,
      status: 'active',
      completedAt: undefined,
      updatedAt: now,
    });
  }

  return {
    ...task,
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  };
}

export function toggleSubtask(task: Task, subtaskId: string): Task {
  return {
    ...task,
    subtasks: task.subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function withDeadlineStatus(task: Task): Task {
  if (task.status === 'completed') {
    return task;
  }

  const nextStatus = isTaskOverdue({ ...task, status: 'active' }) ? 'overdue' : 'active';
  return task.status === nextStatus ? task : { ...task, status: nextStatus };
}

export function normalizeTasks(tasks: Task[]): Task[] {
  let changed = false;
  const normalizedTasks = tasks.map((task) => {
    const normalizedTask = withDeadlineStatus(task);
    if (normalizedTask !== task) {
      changed = true;
    }
    return normalizedTask;
  });

  return changed ? normalizedTasks : tasks;
}

export function filterTasks(
  tasks: Task[],
  filterId: FilterId,
  searchTerm: string,
  categoryId: string,
): Task[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('ru-RU');

  return tasks
    .filter((task) => matchesPrimaryFilter(task, filterId))
    .filter((task) => categoryId === 'all' || task.categoryId === categoryId)
    .filter((task) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${task.title} ${task.description}`.toLocaleLowerCase('ru-RU');
      return haystack.includes(normalizedSearch);
    });
}

export function sortTasks(tasks: Task[], sortBy: SortId): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return comparePriority(a, b) || compareDeadlines(a, b) || compareCreatedAt(a, b);
      case 'createdAt':
        return compareCreatedAt(b, a) || compareTitles(a, b);
      case 'updatedAt':
        return compareUpdatedAt(b, a) || compareTitles(a, b);
      case 'title':
        return compareTitles(a, b) || compareDeadlines(a, b);
      case 'time':
        return compareTimes(a, b) || comparePriority(a, b) || compareTitles(a, b);
      case 'dueDate':
      default:
        return compareDeadlines(a, b) || comparePriority(a, b) || compareCreatedAt(a, b);
    }
  });
}

export function getDefaultSortForViewMode(viewMode: ViewMode): SortId {
  switch (viewMode) {
    case 'board':
      return 'priority';
    case 'week':
    case 'calendar':
      return 'time';
    case 'list':
    default:
      return 'dueDate';
  }
}

export function getSortOptionsForViewMode(viewMode: ViewMode): SortId[] {
  switch (viewMode) {
    case 'board':
      return ['dueDate', 'priority', 'createdAt', 'title'];
    case 'week':
    case 'calendar':
      return ['time', 'priority', 'title'];
    case 'list':
    default:
      return ['dueDate', 'priority', 'createdAt', 'updatedAt', 'title'];
  }
}

export function isSortAvailableForViewMode(sortBy: SortId, viewMode: ViewMode): boolean {
  return getSortOptionsForViewMode(viewMode).includes(sortBy);
}

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'Выполнена';
    case 'overdue':
      return 'Просрочена';
    case 'active':
    default:
      return 'Активна';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
    default:
      return 'Низкий';
  }
}

function sanitizeSubtasks(subtasks: TaskDraft['subtasks']): TaskDraft['subtasks'] {
  return subtasks
    .map((subtask) => ({
      ...subtask,
      title: subtask.title.trim(),
    }))
    .filter((subtask) => subtask.title.length > 0);
}

function matchesPrimaryFilter(task: Task, filterId: FilterId): boolean {
  switch (filterId) {
    case 'active':
      return task.status === 'active';
    case 'completed':
      return task.status === 'completed';
    case 'overdue':
      return task.status === 'overdue';
    case 'today':
      return isTaskDueToday(task);
    case 'week':
      return isTaskDueThisWeek(task);
    case 'high':
      return task.priority === 'high';
    case 'all':
    default:
      return true;
  }
}

function compareDeadlines(a: Task, b: Task): number {
  const aDeadline = getDeadline(a)?.getTime() ?? Number.POSITIVE_INFINITY;
  const bDeadline = getDeadline(b)?.getTime() ?? Number.POSITIVE_INFINITY;
  return aDeadline - bDeadline;
}

function comparePriority(a: Task, b: Task): number {
  return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
}

function compareCreatedAt(a: Task, b: Task): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function compareUpdatedAt(a: Task, b: Task): number {
  return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
}

function compareTitles(a: Task, b: Task): number {
  return a.title.localeCompare(b.title, 'ru-RU', { sensitivity: 'base' });
}

function compareTimes(a: Task, b: Task): number {
  return getTimeSortValue(a.dueTime) - getTimeSortValue(b.dueTime);
}

function getTimeSortValue(time: string): number {
  if (!time) {
    return Number.POSITIVE_INFINITY;
  }

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
