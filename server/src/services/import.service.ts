import { prisma } from '../db/prisma.js';

const UNCATEGORIZED_ID = 'uncategorized';

export async function importLocalData(
  userId: string,
  input: {
    categories: Array<{
      id: string;
      name: string;
      color: string;
      createdAt: string;
    }>;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string;
      dueTime: string;
      priority: string;
      status: string;
      categoryId: string;
      subtasks: Array<{
        id: string;
        title: string;
        completed: boolean;
      }>;
      createdAt: string;
      updatedAt: string;
      completedAt?: string;
    }>;
  },
) {
  const userCategories = input.categories.filter((category) => category.id !== UNCATEGORIZED_ID);
  const existingCategories = await prisma.category.findMany({
    where: {
      id: { in: userCategories.map((category) => category.id) },
    },
    select: { id: true },
  });
  const existingTasks = await prisma.task.findMany({
    where: {
      id: { in: input.tasks.map((task) => task.id) },
    },
    select: { id: true },
  });
  const existingCategoryIds = new Set(existingCategories.map((category) => category.id));
  const existingTaskIds = new Set(existingTasks.map((task) => task.id));
  const categoriesToCreate = userCategories.filter(
    (category) => !existingCategoryIds.has(category.id),
  );
  const tasksToCreate = input.tasks.filter((task) => !existingTaskIds.has(task.id));
  const importedCategoryIds = new Set(
    [...existingCategoryIds, ...categoriesToCreate.map((category) => category.id)],
  );

  await prisma.$transaction(async (transaction) => {
    for (const category of categoriesToCreate) {
      await transaction.category.create({
        data: {
          id: category.id,
          userId,
          name: category.name,
          color: category.color,
          createdAt: new Date(category.createdAt),
        },
      });
    }

    for (const task of tasksToCreate) {
      await transaction.task.create({
        data: {
          id: task.id,
          userId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? new Date(`${task.dueDate}T00:00:00.000Z`) : null,
          dueTime: task.dueTime || null,
          priority: task.priority,
          status: task.status,
          categoryId:
            task.categoryId !== UNCATEGORIZED_ID && importedCategoryIds.has(task.categoryId)
              ? task.categoryId
              : null,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          subtasks: {
            create: task.subtasks.map((subtask, index) => ({
              id: subtask.id,
              title: subtask.title,
              completed: subtask.completed,
              sortOrder: index,
            })),
          },
        },
      });
    }
  });

  return {
    importedTasks: tasksToCreate.length,
    importedCategories: categoriesToCreate.length,
    skipped: existingCategories.length + existingTasks.length,
    errors: [],
  };
}
