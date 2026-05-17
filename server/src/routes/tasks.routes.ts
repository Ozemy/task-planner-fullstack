import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  completeTask,
  createTask,
  deleteTask,
  listTasks,
  reopenTask,
  updateTask,
} from '../services/task.service.js';
import { taskInputSchema, taskPatchSchema } from '../utils/validation.js';

const router = Router();

router.get('/', requireAuth, async (request, response, next) => {
  try {
    response.json(await listTasks(request.auth!.user.id));
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (request, response, next) => {
  try {
    const input = taskInputSchema.parse(request.body);
    response.status(201).json(await createTask(request.auth!.user.id, input));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireAuth, async (request, response, next) => {
  try {
    const input = taskPatchSchema.parse(request.body);
    response.json(await updateTask(request.auth!.user.id, String(request.params.id), input));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    await deleteTask(request.auth!.user.id, String(request.params.id));
    response.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', requireAuth, async (request, response, next) => {
  try {
    response.json(await completeTask(request.auth!.user.id, String(request.params.id)));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/reopen', requireAuth, async (request, response, next) => {
  try {
    response.json(await reopenTask(request.auth!.user.id, String(request.params.id)));
  } catch (error) {
    next(error);
  }
});

export { router as tasksRouter };
