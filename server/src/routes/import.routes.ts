import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { importLocalData } from '../services/import.service.js';
import { importLocalDataSchema } from '../utils/validation.js';

const router = Router();

router.post('/local-data', requireAuth, async (request, response, next) => {
  try {
    const input = importLocalDataSchema.parse(request.body);
    response.json(await importLocalData(request.auth!.user.id, input));
  } catch (error) {
    next(error);
  }
});

export { router as importRouter };
