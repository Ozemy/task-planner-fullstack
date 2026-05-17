import type { Category, PlannerState, Task, TaskDraft } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { DEFAULT_CATEGORY } from '../utils/task';
import { apiRequest } from './client';

export interface ImportLocalDataSummary {
  importedTasks: number;
  importedCategories: number;
  skipped: number;
  errors: string[];
}

interface RemoteTask extends Omit<Task, 'categoryId'> {
  categoryId: string | null;
}

interface RemoteCategory extends Omit<Category, 'color'> {
  color: string | null;
}

interface RemoteTaskPayload extends Omit<TaskDraft, 'categoryId' | 'dueDate' | 'dueTime'> {
  id?: string;
  dueDate: string | null;
  dueTime: string | null;
  categoryId: string | null;
  status?: Task['status'];
}

export async function loadRemotePlannerData(): Promise<{
  tasks: Task[];
  categories: Category[];
}> {
  const [tasks, categories] = await Promise.all([
    apiRequest<RemoteTask[]>('/api/tasks'),
    apiRequest<RemoteCategory[]>('/api/categories'),
  ]);

  return {
    tasks: tasks.map(fromRemoteTask),
    categories: [
      DEFAULT_CATEGORY,
      ...categories.map((category) => ({
        ...category,
        color: category.color ?? '#8c8d91',
      })),
    ],
  };
}

export function createRemoteTask(task: Task): Promise<Task> {
  return apiRequest<RemoteTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(toRemoteTaskPayload(task)),
  }).then(fromRemoteTask);
}

export function updateRemoteTask(task: Task): Promise<Task> {
  return apiRequest<RemoteTask>(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    body: JSON.stringify(toRemoteTaskPayload(task)),
  }).then(fromRemoteTask);
}

export function deleteRemoteTask(taskId: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export function completeRemoteTask(taskId: string): Promise<Task> {
  return apiRequest<RemoteTask>(`/api/tasks/${taskId}/complete`, {
    method: 'PATCH',
  }).then(fromRemoteTask);
}

export function reopenRemoteTask(taskId: string): Promise<Task> {
  return apiRequest<RemoteTask>(`/api/tasks/${taskId}/reopen`, {
    method: 'PATCH',
  }).then(fromRemoteTask);
}

export function createRemoteCategory(category: Category): Promise<Category> {
  return apiRequest<RemoteCategory>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }).then(fromRemoteCategory);
}

export function deleteRemoteCategory(categoryId: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function importLocalPlannerState(state: PlannerState): Promise<ImportLocalDataSummary> {
  return apiRequest<ImportLocalDataSummary>('/api/import/local-data', {
    method: 'POST',
    body: JSON.stringify(state),
  });
}

function toRemoteTaskPayload(task: Task): RemoteTaskPayload {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate || null,
    dueTime: task.dueTime || null,
    priority: task.priority,
    status: task.status,
    categoryId: task.categoryId === UNCATEGORIZED_ID ? null : task.categoryId,
    subtasks: task.subtasks,
  };
}

function fromRemoteTask(task: RemoteTask): Task {
  return {
    ...task,
    categoryId: task.categoryId ?? UNCATEGORIZED_ID,
  };
}

function fromRemoteCategory(category: RemoteCategory): Category {
  return {
    ...category,
    color: category.color ?? '#8c8d91',
  };
}
