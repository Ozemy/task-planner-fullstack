import type { Category, PlannerState, Settings, Task } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import {
  DEFAULT_CATEGORY,
  getDefaultSortForViewMode,
  isSortAvailableForViewMode,
  normalizeTasks,
} from '../utils/task';

const STORAGE_KEY = 'task-planner-state';

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  viewMode: 'list',
  sortBy: 'dueDate',
};

export const DEFAULT_STATE: PlannerState = {
  version: 1,
  tasks: [],
  categories: [DEFAULT_CATEGORY],
  settings: DEFAULT_SETTINGS,
};

export function loadPlannerState(): PlannerState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_STATE;
  }

  return validatePlannerState(JSON.parse(raw));
}

export function savePlannerState(state: PlannerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportPlannerState(state: PlannerState): string {
  return JSON.stringify(state, null, 2);
}

export function importPlannerState(raw: string): PlannerState {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Файл не похож на корректный JSON.');
  }

  return validatePlannerState(parsed);
}

function validatePlannerState(input: unknown): PlannerState {
  if (!isRecord(input) || input.version !== 1) {
    throw new Error('Неподдерживаемая версия файла данных.');
  }

  if (!Array.isArray(input.tasks) || !Array.isArray(input.categories) || !isRecord(input.settings)) {
    throw new Error('В файле отсутствуют обязательные разделы задач, категорий или настроек.');
  }

  const categories = input.categories.filter(isCategory);
  const tasks = input.tasks.filter(isTask);

  if (categories.length !== input.categories.length || tasks.length !== input.tasks.length) {
    throw new Error('Некоторые задачи или категории имеют неверный формат.');
  }

  if (!hasUniqueIds(tasks) || !hasUniqueIds(categories)) {
    throw new Error('В файле есть повторяющиеся идентификаторы задач или категорий.');
  }

  const ensuredCategories = ensureDefaultCategory(categories);

  return {
    version: 1,
    tasks: normalizeTasks(
      tasks.map((task) => ({
        ...task,
        categoryId: ensuredCategories.some((category) => category.id === task.categoryId)
          ? task.categoryId
          : UNCATEGORIZED_ID,
      })),
    ),
    categories: ensuredCategories,
    settings: validateSettings(input.settings),
  };
}

function validateSettings(settings: Record<string, unknown>): Settings {
  const theme = settings.theme === 'dark' ? 'dark' : 'light';
  const viewMode =
    settings.viewMode === 'board' ||
    settings.viewMode === 'week' ||
    settings.viewMode === 'calendar'
      ? settings.viewMode
      : 'list';
  const sortBy =
    isSortId(settings.sortBy) && isSortAvailableForViewMode(settings.sortBy, viewMode)
      ? settings.sortBy
      : getDefaultSortForViewMode(viewMode);

  return { theme, viewMode, sortBy };
}

function ensureDefaultCategory(categories: Category[]): Category[] {
  const withoutDuplicateDefault = categories.filter((category) => category.id !== UNCATEGORIZED_ID);
  return [DEFAULT_CATEGORY, ...withoutDuplicateDefault];
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    typeof value.description === 'string' &&
    isDateInputValue(value.dueDate) &&
    isTimeInputValue(value.dueTime) &&
    (value.priority === 'low' || value.priority === 'medium' || value.priority === 'high') &&
    (value.status === 'active' || value.status === 'completed' || value.status === 'overdue') &&
    typeof value.categoryId === 'string' &&
    Array.isArray(value.subtasks) &&
    value.subtasks.every(isSubtask) &&
    hasUniqueIds(value.subtasks) &&
    isIsoDateString(value.createdAt) &&
    isIsoDateString(value.updatedAt) &&
    (value.completedAt === undefined || isIsoDateString(value.completedAt))
  );
}

function isSubtask(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    typeof value.completed === 'boolean'
  );
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    typeof value.color === 'string' &&
    isIsoDateString(value.createdAt)
  );
}

function isDateInputValue(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  if (value === '') {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isTimeInputValue(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  if (value === '') {
    return true;
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function isIsoDateString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === value;
}

function isSortId(value: unknown): value is Settings['sortBy'] {
  return (
    value === 'dueDate' ||
    value === 'priority' ||
    value === 'createdAt' ||
    value === 'updatedAt' ||
    value === 'title' ||
    value === 'time'
  );
}

function hasUniqueIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size === items.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
