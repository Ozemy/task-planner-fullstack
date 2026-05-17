import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword } from '../utils/password.js';
import { createSessionToken } from '../utils/session.js';
import { createSessionForUser, serializeAuthPayload } from './auth.service.js';

interface GoogleTokenInfo {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
}

export async function loginWithGoogle({
  credential,
  request,
  response,
}: {
  credential: string;
  request: Request;
  response: Response;
}) {
  if (!env.googleClientId) {
    throw new HttpError(
      503,
      'Google-вход не настроен. Добавьте OAuth Client ID.',
      'GOOGLE_NOT_CONFIGURED',
    );
  }

  const tokenInfo = await verifyGoogleCredential(credential);
  if (
    tokenInfo.aud !== env.googleClientId ||
    !tokenInfo.sub ||
    !tokenInfo.email ||
    tokenInfo.email_verified !== 'true'
  ) {
    throw new HttpError(401, 'Не удалось подтвердить Google-аккаунт.', 'GOOGLE_TOKEN_INVALID');
  }

  const normalizedEmail = tokenInfo.email.trim().toLowerCase();
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleSubject: tokenInfo.sub }, { email: normalizedEmail }],
    },
    include: {
      productivityProfile: true,
      settings: true,
    },
  });

  if (user && user.googleSubject && user.googleSubject !== tokenInfo.sub) {
    throw new HttpError(
      409,
      'Этот email уже связан с другим Google-аккаунтом.',
      'GOOGLE_ACCOUNT_CONFLICT',
    );
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        nickname: tokenInfo.name?.trim() || normalizedEmail.split('@')[0],
        googleSubject: tokenInfo.sub,
        emailVerifiedAt: new Date(),
        passwordHash: await hashPassword(createSessionToken()),
        productivityProfile: { create: {} },
        settings: {
          create: {
            dashboardWidgets: {
              setupCompleted: false,
              focusPanel: false,
              taskComposer: true,
              smartPlannerSummary: true,
              smartPlanner: false,
              focusSession: false,
              dashboardIllustration: false,
              dayFlow: false,
              mobileCategoryChips: true,
            },
          },
        },
      },
      include: {
        productivityProfile: true,
        settings: true,
      },
    });
  } else if (!user.googleSubject) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleSubject: tokenInfo.sub,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
      include: {
        productivityProfile: true,
        settings: true,
      },
    });
  }

  if (!user.productivityProfile || !user.settings) {
    throw new HttpError(500, 'Профиль пользователя повреждён.');
  }

  await createSessionForUser(user.id, request, response);
  return serializeAuthPayload(user, user.productivityProfile, user.settings);
}

async function verifyGoogleCredential(credential: string): Promise<GoogleTokenInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );

  if (!response.ok) {
    throw new HttpError(401, 'Не удалось подтвердить Google-аккаунт.', 'GOOGLE_TOKEN_INVALID');
  }

  return (await response.json()) as GoogleTokenInfo;
}
