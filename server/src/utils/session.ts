import { createHmac, randomBytes } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'task_planner_session';

export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
  return createHmac('sha256', env.sessionSecret).update(token).digest('hex');
}

export function getSessionExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.sessionMaxAgeDays);
  return expiresAt;
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE_NAME, {
    ...getSessionCookieOptions(),
    maxAge: undefined,
  });
}

function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
    maxAge: env.sessionMaxAgeDays * 24 * 60 * 60 * 1000,
  };
}
