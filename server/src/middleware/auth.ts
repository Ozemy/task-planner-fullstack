import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { hashSessionToken, SESSION_COOKIE_NAME } from '../utils/session.js';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    const token = request.cookies?.[SESSION_COOKIE_NAME];
    if (typeof token !== 'string' || !token) {
      throw new HttpError(401, 'Требуется авторизация.', 'UNAUTHORIZED');
    }

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: hashSessionToken(token) },
      include: {
        user: {
          include: {
            productivityProfile: true,
            settings: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.productivityProfile ||
      !session.user.settings
    ) {
      throw new HttpError(401, 'Сессия недействительна.', 'UNAUTHORIZED');
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    request.auth = {
      user: session.user,
      session,
      profile: session.user.productivityProfile,
      settings: session.user.settings,
    };

    next();
  } catch (error) {
    next(error);
  }
};
