import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { updateSettingsSchema } from '../utils/validation.js';

const router = Router();

router.get('/', requireAuth, (request, response) => {
  response.json(request.auth!.settings);
});

router.patch('/', requireAuth, async (request, response, next) => {
  try {
    const input = updateSettingsSchema.parse(request.body);
    const settings = await prisma.userSettings.update({
      where: { userId: request.auth!.user.id },
      data: input,
    });

    response.json(settings);
  } catch (error) {
    next(error);
  }
});

export { router as settingsRouter };
