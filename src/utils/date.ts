import type { Task } from '../types/planner';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getDeadline(task: Pick<Task, 'dueDate' | 'dueTime'>): Date | null {
  if (!task.dueDate) {
    return null;
  }

  const dateTime = `${task.dueDate}T${task.dueTime || '23:59'}`;
  const deadline = new Date(dateTime);
  return Number.isNaN(deadline.getTime()) ? null : deadline;
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'dueTime' | 'status'>): boolean {
  if (task.status === 'completed') {
    return false;
  }

  const deadline = getDeadline(task);
  return Boolean(deadline && deadline.getTime() < Date.now());
}

export function isTaskDueToday(task: Pick<Task, 'dueDate'>): boolean {
  if (!task.dueDate) {
    return false;
  }

  return task.dueDate === toDateInputValue(new Date());
}

export function isTaskDueThisWeek(task: Pick<Task, 'dueDate'>): boolean {
  if (!task.dueDate) {
    return false;
  }

  const target = new Date(`${task.dueDate}T12:00`);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const now = new Date();
  const start = startOfWeek(now);
  const end = new Date(start.getTime() + DAY_IN_MS * 7);
  return target >= start && target < end;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) {
    return 'Без дедлайна';
  }

  const date = new Date(`${dateString}T12:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Некорректная дата';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(task: Pick<Task, 'dueDate' | 'dueTime'>): string {
  if (!task.dueDate) {
    return 'Без дедлайна';
  }

  return `${formatDate(task.dueDate)}${task.dueTime ? `, ${task.dueTime}` : ''}`;
}

export function getWeekDays(anchorDate = new Date()): Date[] {
  const start = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => new Date(start.getTime() + DAY_IN_MS * index));
}

export function getVisibleWeekDays(anchorDate = new Date(), today = new Date()): Date[] {
  const weekDays = getWeekDays(anchorDate);
  const currentWeekStart = startOfWeek(today);
  const requestedWeekStart = startOfWeek(anchorDate);

  if (!isSameDay(currentWeekStart, requestedWeekStart)) {
    return weekDays;
  }

  return weekDays.filter((day) => !isBeforeDay(day, today));
}

export function getMonthGridDays(anchorDate = new Date()): Date[] {
  const firstDayOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = startOfWeek(firstDayOfMonth);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getTime() + DAY_IN_MS * index));
}

export function getVisibleMonthGridDays(anchorDate: Date, today = new Date()): Array<Date | null> {
  if (!isSameMonth(anchorDate, today)) {
    return getMonthGridDays(anchorDate);
  }

  const start = startOfDay(today);
  const cells: Array<Date | null> = Array.from(
    { length: getMondayWeekdayIndex(start) },
    () => null,
  );
  const endOfMonth = shiftMonth(anchorDate, 1);
  let cursor = new Date(start);

  while (cursor < endOfMonth) {
    cells.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  while (cells.length < 35 || cells.length % 7 !== 0) {
    cells.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return cells;
}

export function shiftMonth(anchorDate: Date, amount: number): Date {
  return new Date(anchorDate.getFullYear(), anchorDate.getMonth() + amount, 1);
}

export function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function monthHasVisibleDates(anchorDate: Date, today = new Date()): boolean {
  const monthEnd = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  return !isBeforeDay(monthEnd, today);
}

export function isBeforeDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() < startOfDay(right).getTime();
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const weekday = copy.getDay() || 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - weekday + 1);
  return copy;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getMondayWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}
