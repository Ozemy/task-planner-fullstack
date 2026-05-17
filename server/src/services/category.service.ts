import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createCategory(
  userId: string,
  input: { id?: string; name: string; color?: string | null },
) {
  return prisma.category.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      userId,
      name: input.name,
      color: input.color ?? null,
    },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: { name?: string; color?: string | null },
) {
  await assertCategoryOwner(userId, categoryId);

  return prisma.category.update({
    where: { id: categoryId },
    data: input,
  });
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  await assertCategoryOwner(userId, categoryId);

  await prisma.$transaction([
    prisma.task.updateMany({
      where: { userId, categoryId },
      data: { categoryId: null },
    }),
    prisma.category.delete({
      where: { id: categoryId },
    }),
  ]);
}

export async function assertCategoryOwner(userId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  });

  if (!category) {
    throw new HttpError(404, 'Категория не найдена.', 'CATEGORY_NOT_FOUND');
  }
}
