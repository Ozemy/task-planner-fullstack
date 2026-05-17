import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import {
  loginUser,
  registerUser,
  serializeAuthPayload,
} from '../services/auth.service.js';
import {
  confirmEmailVerification,
  requestEmailVerification,
} from '../services/emailVerification.service.js';
import { loginWithGoogle } from '../services/googleAuth.service.js';
import { clearSessionCookie } from '../utils/session.js';
import {
  confirmEmailVerificationSchema,
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from '../utils/validation.js';

const router = Router();

router.post('/register', authRateLimit, async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    const payload = await registerUser({
      ...input,
      request,
      response,
    });

    response.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/login', authRateLimit, async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const payload = await loginUser({
      ...input,
      request,
      response,
    });

    response.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAuth, async (request, response, next) => {
  try {
    await prisma.session.update({
      where: { id: request.auth!.session.id },
      data: { revokedAt: new Date() },
    });
    clearSessionCookie(response);
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/email-verification/request', requireAuth, async (request, response, next) => {
  try {
    response.json(await requestEmailVerification(request.auth!.user.id));
  } catch (error) {
    next(error);
  }
});

router.post('/email-verification/confirm', async (request, response, next) => {
  try {
    const input = confirmEmailVerificationSchema.parse(request.body);
    response.json(await confirmEmailVerification(input.token));
  } catch (error) {
    next(error);
  }
});

router.post('/google', authRateLimit, async (request, response, next) => {
  try {
    const input = googleAuthSchema.parse(request.body);
    response.json(
      await loginWithGoogle({
        credential: input.credential,
        request,
        response,
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (request, response) => {
  response.json(
    serializeAuthPayload(request.auth!.user, request.auth!.profile, request.auth!.settings),
  );
});

export { router as authRouter };
