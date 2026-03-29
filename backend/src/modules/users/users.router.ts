import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema } from '../../utils/validators';
import { usersController } from './users.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', (req, res, next) => usersController.listUsers(req as any, res, next));
router.post('/', validate(createUserSchema), (req, res, next) => usersController.createUser(req as any, res, next));
router.patch('/:id', validate(updateUserSchema), (req, res, next) => usersController.updateUser(req as any, res, next));
router.delete('/:id', (req, res, next) => usersController.deleteUser(req as any, res, next));

export default router;
