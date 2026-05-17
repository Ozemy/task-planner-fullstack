import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../services/category.service.js';
import { categoryInputSchema } from '../utils/validation.js';

const router = Router();

router.get('/', requireAuth, async (request, response, next) => {
  try {
    response.json(await listCategories(request.auth!.user.id));
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (request, response, next) => {
  try {
    const input = categoryInputSchema.parse(request.body);
    response.status(201).json(await createCategory(request.auth!.user.id, input));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireAuth, async (request, response, next) => {
  try {
    const input = categoryInputSchema.partial().parse(request.body);
    response.json(await updateCategory(request.auth!.user.id, String(request.params.id), input));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    await deleteCategory(request.auth!.user.id, String(request.params.id));
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export { router as categoriesRouter };
