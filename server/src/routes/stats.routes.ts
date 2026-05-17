import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getOverviewStats } from '../services/stats.service.js';

const router = Router();

router.get('/overview', requireAuth, async (request, response, next) => {
  try {
    response.json(await getOverviewStats(request.auth!.user.id));
  } catch (error) {
    next(error);
  }
});

export { router as statsRouter };
