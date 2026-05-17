import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { updateProfileSchema } from '../utils/validation.js';

const router = Router();

router.get('/', requireAuth, (request, response) => {
  response.json(request.auth!.profile);
});

router.patch('/', requireAuth, async (request, response, next) => {
  try {
    const input = updateProfileSchema.parse(request.body);
    const profile = await prisma.productivityProfile.update({
      where: { userId: request.auth!.user.id },
      data: input,
    });

    response.json(profile);
  } catch (error) {
    next(error);
  }
});

export { router as profileRouter };
