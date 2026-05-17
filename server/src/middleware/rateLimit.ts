import type { RequestHandler } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, RateLimitEntry>();

export const authRateLimit: RequestHandler = (request, response, next) => {
  const now = Date.now();
  const key = `${request.ip}:${request.path}`;
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (current.count >= MAX_ATTEMPTS) {
    response.status(429).json({
      message: 'Слишком много попыток. Попробуйте снова позже.',
    });
    return;
  }

  current.count += 1;
  next();
};
