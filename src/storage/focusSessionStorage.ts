import { toDateInputValue } from '../utils/date';

const STORAGE_KEY = 'task-planner-focus-session';

export interface FocusSessionStats {
  date: string;
  completedToday: number;
  lastDurationMinutes?: number;
}

export function loadFocusSessionStats(): FocusSessionStats {
  const today = toDateInputValue(new Date());

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyStats(today);
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isFocusSessionStats(parsed) || parsed.date !== today) {
      return createEmptyStats(today);
    }

    return parsed;
  } catch {
    return createEmptyStats(today);
  }
}

export function recordCompletedFocusSession(durationMinutes: number): FocusSessionStats {
  const current = loadFocusSessionStats();
  const next: FocusSessionStats = {
    ...current,
    completedToday: current.completedToday + 1,
    lastDurationMinutes: durationMinutes,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function createEmptyStats(date: string): FocusSessionStats {
  return {
    date,
    completedToday: 0,
  };
}

function isFocusSessionStats(value: unknown): value is FocusSessionStats {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Partial<FocusSessionStats>;
  return (
    typeof stats.date === 'string' &&
    typeof stats.completedToday === 'number' &&
    Number.isInteger(stats.completedToday) &&
    stats.completedToday >= 0 &&
    (stats.lastDurationMinutes === undefined ||
      (Number.isInteger(stats.lastDurationMinutes) && stats.lastDurationMinutes > 0))
  );
}
