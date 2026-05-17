import type { Task } from '../types/planner';
import { getDeadline, isTaskDueToday } from './date';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type WorkloadLevel = 'low' | 'medium' | 'high';

export interface SmartPlannerRecommendation {
  task: Task;
  reason: string;
  score: number;
}

export interface SmartPlannerResult {
  topTask: SmartPlannerRecommendation | null;
  todayPlan: SmartPlannerRecommendation[];
  overdueCount: number;
  highPriorityCount: number;
  workloadLevel: WorkloadLevel;
  recommendationText: string;
  suggestedActions: string[];
  todayCount: number;
  completedCount: number;
  undatedCount: number;
}

export function buildSmartPlanner(tasks: Task[], now = new Date()): SmartPlannerResult {
  const incompleteTasks = tasks.filter((task) => task.status !== 'completed');
  const overdueTasks = incompleteTasks.filter((task) => task.status === 'overdue');
  const todayTasks = incompleteTasks.filter((task) => isTaskDueToday(task));
  const highPriorityTasks = incompleteTasks.filter((task) => task.priority === 'high');
  const undatedTasks = incompleteTasks.filter((task) => !task.dueDate);
  const completedCount = tasks.length - incompleteTasks.length;
  const recommendations = incompleteTasks
    .map((task) => buildRecommendation(task, now))
    .sort((left, right) => right.score - left.score || compareDeadlines(left.task, right.task));
  const workloadLevel = getWorkloadLevel(todayTasks.length, overdueTasks.length);

  return {
    topTask: recommendations[0] ?? null,
    todayPlan: recommendations.slice(0, 5),
    overdueCount: overdueTasks.length,
    highPriorityCount: highPriorityTasks.length,
    workloadLevel,
    recommendationText: getRecommendationText({
      incompleteCount: incompleteTasks.length,
      todayCount: todayTasks.length,
      overdueCount: overdueTasks.length,
      undatedCount: undatedTasks.length,
      workloadLevel,
    }),
    suggestedActions: getSuggestedActions({
      topTask: recommendations[0]?.task ?? null,
      overdueCount: overdueTasks.length,
      highPriorityCount: highPriorityTasks.length,
      undatedCount: undatedTasks.length,
      workloadLevel,
    }),
    todayCount: todayTasks.length,
    completedCount,
    undatedCount: undatedTasks.length,
  };
}

function buildRecommendation(task: Task, now: Date): SmartPlannerRecommendation {
  const deadline = getDeadline(task);
  const daysUntilDeadline = deadline ? getDayDistance(deadline, now) : null;
  const ageInDays = Math.max(0, getDayDistance(now, new Date(task.createdAt)));
  const score =
    getDeadlineScore(task, daysUntilDeadline) +
    getPriorityScore(task) +
    Math.min(task.subtasks.length * 3, 12) +
    Math.min(ageInDays, 10);

  return {
    task,
    reason: getRecommendationReason(task, daysUntilDeadline, ageInDays),
    score,
  };
}

function getDeadlineScore(task: Task, daysUntilDeadline: number | null): number {
  if (task.status === 'overdue') {
    return 100;
  }

  if (daysUntilDeadline === null) {
    return 6;
  }

  if (daysUntilDeadline <= 0) {
    return 72;
  }

  if (daysUntilDeadline <= 7) {
    return 48 - daysUntilDeadline * 5;
  }

  return 10;
}

function getPriorityScore(task: Task): number {
  switch (task.priority) {
    case 'high':
      return 25;
    case 'medium':
      return 12;
    case 'low':
    default:
      return 4;
  }
}

function getRecommendationReason(
  task: Task,
  daysUntilDeadline: number | null,
  ageInDays: number,
): string {
  if (task.status === 'overdue') {
    return task.priority === 'high'
      ? 'Просрочена, стоит закрыть первой'
      : 'Просрочено';
  }

  if (daysUntilDeadline !== null && daysUntilDeadline <= 0) {
    return task.priority === 'high'
      ? 'Дедлайн сегодня и высокий приоритет'
      : 'Дедлайн сегодня';
  }

  if (task.priority === 'high' && !task.dueDate) {
    return 'Высокий приоритет без дедлайна';
  }

  if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
    return 'Ближайший дедлайн';
  }

  if (ageInDays >= 7) {
    return 'Давно создана';
  }

  if (task.priority === 'high') {
    return 'Высокий приоритет';
  }

  return 'Можно закрыть в свободное окно';
}

function getWorkloadLevel(todayCount: number, overdueCount: number): WorkloadLevel {
  if (todayCount >= 5 || overdueCount >= 3 || (todayCount >= 4 && overdueCount >= 1)) {
    return 'high';
  }

  if (todayCount >= 3 || overdueCount >= 1) {
    return 'medium';
  }

  return 'low';
}

function getRecommendationText({
  incompleteCount,
  todayCount,
  overdueCount,
  undatedCount,
  workloadLevel,
}: {
  incompleteCount: number;
  todayCount: number;
  overdueCount: number;
  undatedCount: number;
  workloadLevel: WorkloadLevel;
}): string {
  if (incompleteCount === 0) {
    return 'Все активные задачи закрыты. Можно спокойно спланировать следующий шаг.';
  }

  if (workloadLevel === 'high') {
    return 'Похоже, день перегружен. Лучше выбрать 2-3 главные задачи и перенести остальное.';
  }

  if (overdueCount > 0) {
    return 'Сначала разберите просроченные задачи, затем переходите к ближайшим дедлайнам.';
  }

  if (todayCount > 0) {
    return `На сегодня запланировано ${todayCount} ${getTaskWord(todayCount)}. Начните с самой важной.`;
  }

  if (undatedCount > 0) {
    return 'Есть задачи без дедлайна. Уточните сроки, чтобы план дня стал точнее.';
  }

  return 'Начните с ближайшего дедлайна и держите фокус на одной задаче за раз.';
}

function getSuggestedActions({
  topTask,
  overdueCount,
  highPriorityCount,
  undatedCount,
  workloadLevel,
}: {
  topTask: Task | null;
  overdueCount: number;
  highPriorityCount: number;
  undatedCount: number;
  workloadLevel: WorkloadLevel;
}): string[] {
  const actions: string[] = [];

  if (overdueCount > 0) {
    actions.push('Сначала закройте просроченные задачи.');
  }

  if (workloadLevel === 'high') {
    actions.push('Выберите 2-3 главные задачи и перенесите второстепенные.');
  }

  if (highPriorityCount > 0) {
    actions.push('Зарезервируйте фокус-время для задач высокого приоритета.');
  }

  if (undatedCount > 0) {
    actions.push('Назначьте дедлайн задачам без даты.');
  }

  if (topTask?.subtasks.some((subtask) => !subtask.completed)) {
    actions.push('Начните с ближайшей незавершенной подзадачи главной задачи.');
  }

  return actions.slice(0, 3);
}

function compareDeadlines(left: Task, right: Task): number {
  const leftDeadline = getDeadline(left)?.getTime() ?? Number.POSITIVE_INFINITY;
  const rightDeadline = getDeadline(right)?.getTime() ?? Number.POSITIVE_INFINITY;
  return leftDeadline - rightDeadline;
}

function getDayDistance(left: Date, right: Date): number {
  const leftStart = new Date(left);
  const rightStart = new Date(right);
  leftStart.setHours(0, 0, 0, 0);
  rightStart.setHours(0, 0, 0, 0);
  return Math.round((leftStart.getTime() - rightStart.getTime()) / DAY_IN_MS);
}

function getTaskWord(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;

  if (remainder100 >= 11 && remainder100 <= 14) {
    return 'задач';
  }

  if (remainder10 === 1) {
    return 'задача';
  }

  if (remainder10 >= 2 && remainder10 <= 4) {
    return 'задачи';
  }

  return 'задач';
}
