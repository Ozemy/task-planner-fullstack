import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { toNullableDate } from '../utils/validation.js';
import { assertCategoryOwner } from './category.service.js';

export interface TaskInput {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority: 'low' | 'medium' | 'high';
  status?: 'active' | 'completed' | 'overdue';
  categoryId?: string | null;
  subtasks: Array<{
    id?: string;
    title: string;
    completed: boolean;
  }>;
}

export async function listTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: {
      subtasks: {
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return tasks.map(serializeTask);
}

export async function createTask(userId: string, input: TaskInput) {
  await assertOwnedCategoryIfPresent(userId, input.categoryId);

  const task = await prisma.task.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      userId,
      title: input.title,
      description: input.description ?? '',
      dueDate: toNullableDate(input.dueDate),
      dueTime: input.dueTime ?? null,
      priority: input.priority,
      status: input.status ?? 'active',
      categoryId: input.categoryId ?? null,
      completedAt: input.status === 'completed' ? new Date() : null,
      subtasks: {
        create: input.subtasks.map((subtask, index) => ({
          ...(subtask.id ? { id: subtask.id } : {}),
          title: subtask.title,
          completed: subtask.completed,
          sortOrder: index,
        })),
      },
    },
    include: {
      subtasks: {
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
    },
  });

  return serializeTask(task);
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: Partial<TaskInput>,
) {
  await assertTaskOwner(userId, taskId);
  await assertOwnedCategoryIfPresent(userId, input.categoryId);

  const data: Prisma.TaskUpdateInput = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.dueDate !== undefined ? { dueDate: toNullableDate(input.dueDate) } : {}),
    ...(input.dueTime !== undefined ? { dueTime: input.dueTime } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.status !== undefined
      ? {
          status: input.status,
          completedAt: input.status === 'completed' ? new Date() : null,
        }
      : {}),
    ...(input.categoryId !== undefined
      ? {
          category: input.categoryId
            ? { connect: { id: input.categoryId } }
            : { disconnect: true },
        }
      : {}),
  };

  if (input.subtasks) {
    await prisma.$transaction([
      prisma.subtask.deleteMany({ where: { taskId } }),
      prisma.task.update({
        where: { id: taskId },
        data: {
          ...data,
          subtasks: {
            create: input.subtasks.map((subtask, index) => ({
              ...(subtask.id ? { id: subtask.id } : {}),
              title: subtask.title,
              completed: subtask.completed,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);
  } else {
    await prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  return getTaskOrThrow(userId, taskId);
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await assertTaskOwner(userId, taskId);
  await prisma.task.delete({ where: { id: taskId } });
}

export async function completeTask(userId: string, taskId: string) {
  await assertTaskOwner(userId, taskId);
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });
  return getTaskOrThrow(userId, taskId);
}

export async function reopenTask(userId: string, taskId: string) {
  await assertTaskOwner(userId, taskId);
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'active',
      completedAt: null,
    },
  });
  return getTaskOrThrow(userId, taskId);
}

async function getTaskOrThrow(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      subtasks: {
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
    },
  });

  if (!task) {
    throw new HttpError(404, 'Задача не найдена.', 'TASK_NOT_FOUND');
  }

  return serializeTask(task);
}

async function assertTaskOwner(userId: string, taskId: string): Promise<void> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });

  if (!task) {
    throw new HttpError(404, 'Задача не найдена.', 'TASK_NOT_FOUND');
  }
}

async function assertOwnedCategoryIfPresent(
  userId: string,
  categoryId: string | null | undefined,
): Promise<void> {
  if (categoryId) {
    await assertCategoryOwner(userId, categoryId);
  }
}

function serializeTask(task: {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  dueTime: string | null;
  priority: string;
  status: string;
  categoryId: string | null;
  category: { id: string; name: string; color: string | null } | null;
  subtasks: Array<{ id: string; title: string; completed: boolean }>;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : '',
    dueTime: task.dueTime ?? '',
    priority: task.priority,
    status: task.status,
    categoryId: task.categoryId,
    category: task.category,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
    })),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };
}
