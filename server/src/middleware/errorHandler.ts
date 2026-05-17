import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;

  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Проверьте введённые данные.',
      code: 'VALIDATION_ERROR',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    response.status(409).json({
      message: 'Запись с такими данными уже существует.',
      code: 'CONFLICT',
    });
    return;
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    response.status(503).json({
      message: 'База данных недоступна. Запустите npm run db:up и npm run db:migrate.',
      code: 'DATABASE_UNAVAILABLE',
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    message:
      env.nodeEnv === 'production'
        ? 'Внутренняя ошибка сервера.'
        : error instanceof Error
          ? error.message
          : 'Внутренняя ошибка сервера.',
    code: env.nodeEnv === 'production' ? undefined : 'INTERNAL_SERVER_ERROR',
  });
};
