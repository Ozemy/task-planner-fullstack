import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { importRouter } from './routes/import.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { statsRouter } from './routes/stats.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { userRouter } from './routes/user.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', async (_request, response) => {
  let database: 'ok' | 'unavailable' = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'unavailable';
  }

  response.json({
    status: 'ok',
    database,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/import', importRouter);
app.use('/api/stats', statsRouter);
app.use(errorHandler);
