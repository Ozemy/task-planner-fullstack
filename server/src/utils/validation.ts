import { z } from 'zod';

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_INPUT_PATTERN = /^\d{2}:\d{2}$/;

export const dashboardWidgetsSchema = z.object({
  setupCompleted: z.boolean(),
  focusPanel: z.boolean(),
  taskComposer: z.boolean(),
  smartPlannerSummary: z.boolean(),
  smartPlanner: z.boolean(),
  focusSession: z.boolean(),
  dashboardIllustration: z.boolean(),
  dayFlow: z.boolean(),
  mobileCategoryChips: z.boolean(),
});

export const registerSchema = z.object({
  email: z.string().trim().email('Введите корректный email.'),
  password: z.string().min(8, 'Пароль должен быть не короче 8 символов.'),
  nickname: z
    .string()
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа.')
    .max(40, 'Имя должно быть не длиннее 40 символов.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Введите корректный email.'),
  password: z.string().min(1, 'Введите пароль.'),
});

export const confirmEmailVerificationSchema = z.object({
  token: z.string().trim().min(1, 'Токен подтверждения обязателен.'),
});

export const googleAuthSchema = z.object({
  credential: z.string().trim().min(1, 'Google credential обязателен.'),
});

export const updateUserSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, 'Имя должно содержать минимум 2 символа.')
    .max(40, 'Имя должно быть не длиннее 40 символов.'),
});

export const updateProfileSchema = z.object({
  workMode: z.enum(['study', 'work', 'personal', 'project', 'mixed']).optional(),
  dailyMainTasksTarget: z.number().int().min(1).max(5).optional(),
  preferredFocusMinutes: z.union([z.literal(15), z.literal(25), z.literal(45)]).optional(),
  peakTime: z.enum(['morning', 'day', 'evening', 'night']).optional(),
  planningStyle: z.enum(['calm', 'balanced', 'strict']).optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().trim().min(1).max(80).nullable().optional(),
  locale: z.string().trim().min(2).max(20).optional(),
  dashboardWidgets: dashboardWidgetsSchema.optional(),
});

export const subtaskInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1, 'Название подзадачи не должно быть пустым.'),
  completed: z.boolean().default(false),
});

export const taskInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1, 'Введите название задачи.'),
  description: z.string().trim().default(''),
  dueDate: z
    .string()
    .trim()
    .regex(DATE_INPUT_PATTERN, 'Дата должна быть в формате YYYY-MM-DD.')
    .nullable()
    .optional(),
  dueTime: z
    .string()
    .trim()
    .regex(TIME_INPUT_PATTERN, 'Время должно быть в формате HH:MM.')
    .nullable()
    .optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['active', 'completed', 'overdue']).optional(),
  categoryId: z.string().trim().min(1).nullable().optional(),
  subtasks: z.array(subtaskInputSchema).default([]),
});

export const taskPatchSchema = taskInputSchema.partial();

export const categoryInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Введите название категории.').max(80),
  color: z.string().trim().min(1).max(40).nullable().optional(),
});

const importCategorySchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  createdAt: z.string().datetime(),
});

const importSubtaskSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  completed: z.boolean(),
});

const importTaskSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string(),
  dueDate: z.string(),
  dueTime: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['active', 'completed', 'overdue']),
  categoryId: z.string(),
  subtasks: z.array(importSubtaskSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export const importLocalDataSchema = z.object({
  version: z.literal(1),
  categories: z.array(importCategorySchema),
  tasks: z.array(importTaskSchema),
});

export function toNullableDate(value: string | null | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}
