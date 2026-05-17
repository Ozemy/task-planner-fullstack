import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeAuthPayload } from '../services/auth.service.js';
import { updateUserSchema } from '../utils/validation.js';

const router = Router();

router.patch('/me', requireAuth, async (request, response, next) => {
  try {
    const input = updateUserSchema.parse(request.body);
    const user = await prisma.user.update({
      where: { id: request.auth!.user.id },
      data: { nickname: input.nickname },
      include: {
        productivityProfile: true,
        settings: true,
      },
    });

    response.json(serializeAuthPayload(user, user.productivityProfile!, user.settings!));
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
