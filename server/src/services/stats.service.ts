import { prisma } from '../db/prisma.js';

export async function getOverviewStats(userId: string) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const [total, completed, overdue, today, focusSessionsToday] = await prisma.$transaction([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'completed' } }),
    prisma.task.count({ where: { userId, status: 'overdue' } }),
    prisma.task.count({
      where: {
        userId,
        dueDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      },
    }),
    prisma.focusSessionLog.count({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lt: tomorrowStart,
        },
        status: 'completed',
      },
    }),
  ]);

  return {
    total,
    completed,
    overdue,
    today,
    focusSessionsToday,
  };
}
