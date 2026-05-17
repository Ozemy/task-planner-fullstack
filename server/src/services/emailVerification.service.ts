import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { createSessionToken, hashSessionToken } from '../utils/session.js';

export async function requestEmailVerification(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerifiedAt: true },
  });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден.', 'USER_NOT_FOUND');
  }

  if (user.emailVerifiedAt) {
    return { success: true, alreadyVerified: true, delivery: 'none' as const };
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  const verificationUrl = `${env.clientOrigin}/?verifyEmail=${encodeURIComponent(token)}`;

  if (!env.smtpHost) {
    if (env.nodeEnv === 'development') {
      console.info(`[email verification] ${user.email}: ${verificationUrl}`);
      return { success: true, alreadyVerified: false, delivery: 'console' as const };
    }

    throw new HttpError(
      503,
      'SMTP не настроен. Добавьте параметры почты для отправки писем.',
      'SMTP_NOT_CONFIGURED',
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth:
      env.smtpUser && env.smtpPass
        ? {
            user: env.smtpUser,
            pass: env.smtpPass,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: env.smtpFrom,
    to: user.email,
    subject: 'Подтвердите email для Task Planner',
    text: `Подтвердите email, открыв ссылку: ${verificationUrl}`,
  });

  return { success: true, alreadyVerified: false, delivery: 'email' as const };
}

export async function confirmEmailVerification(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new HttpError(
      400,
      'Ссылка подтверждения недействительна или устарела.',
      'EMAIL_TOKEN_INVALID',
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
