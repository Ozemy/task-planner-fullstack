export const UNCATEGORIZED_ID = 'uncategorized';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'active' | 'completed' | 'overdue';
export type ViewMode = 'list' | 'board' | 'week' | 'calendar';
export type FilterId =
  | 'all'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'today'
  | 'week'
  | 'high';
export type SortId = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'title' | 'time';
export type Theme = 'light' | 'dark';
export type NoticeKind = 'success' | 'error' | 'info';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  status: TaskStatus;
  categoryId: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Settings {
  theme: Theme;
  viewMode: ViewMode;
  sortBy: SortId;
}

export interface PlannerState {
  version: 1;
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}

export interface Notice {
  kind: NoticeKind;
  text: string;
}

export interface TaskDraft {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  categoryId: string;
  subtasks: Subtask[];
}
