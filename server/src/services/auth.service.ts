import type { ProductivityProfile, User, UserSettings } from '@prisma/client';
import type { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  setSessionCookie,
} from '../utils/session.js';

export const DEFAULT_DASHBOARD_WIDGETS = {
  setupCompleted: false,
  focusPanel: false,
  taskComposer: true,
  smartPlannerSummary: true,
  smartPlanner: false,
  focusSession: false,
  dashboardIllustration: false,
  dayFlow: false,
  mobileCategoryChips: true,
};

export interface PublicUser {
  id: string;
  email: string;
  nickname: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  user: PublicUser;
  profile: ProductivityProfile;
  settings: UserSettings;
}

export async function registerUser({
  email,
  password,
  nickname,
  request,
  response,
}: {
  email: string;
  password: string;
  nickname: string;
  request: Request;
  response: Response;
}): Promise<AuthPayload> {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new HttpError(409, 'Пользователь с таким email уже существует.', 'EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      nickname: nickname.trim(),
      productivityProfile: {
        create: {},
      },
      settings: {
        create: {
          dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
        },
      },
    },
    include: {
      productivityProfile: true,
      settings: true,
    },
  });

  await createSessionForUser(user.id, request, response);

  if (!user.productivityProfile || !user.settings) {
    throw new HttpError(500, 'Не удалось создать профиль пользователя.');
  }

  return serializeAuthPayload(user, user.productivityProfile, user.settings);
}

export async function loginUser({
  email,
  password,
  request,
  response,
}: {
  email: string;
  password: string;
  request: Request;
  response: Response;
}): Promise<AuthPayload> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      productivityProfile: true,
      settings: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Неверный email или пароль.', 'INVALID_CREDENTIALS');
  }

  if (!user.productivityProfile || !user.settings) {
    throw new HttpError(500, 'Профиль пользователя повреждён.');
  }

  await createSessionForUser(user.id, request, response);
  return serializeAuthPayload(user, user.productivityProfile, user.settings);
}

export function serializeAuthPayload(
  user: User,
  profile: ProductivityProfile,
  settings: UserSettings,
): AuthPayload {
  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    profile,
    settings,
  };
}

export async function createSessionForUser(
  userId: string,
  request: Request,
  response: Response,
): Promise<void> {
  const token = createSessionToken();

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash: hashSessionToken(token),
      userAgent: request.get('user-agent') ?? null,
      ipAddress: request.ip,
      expiresAt: getSessionExpiry(),
    },
  });

  setSessionCookie(response, token);
}
