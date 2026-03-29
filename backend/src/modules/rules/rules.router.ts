import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { rulesController } from './rules.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', (req, res, next) => rulesController.listRules(req as any, res, next));
router.post('/', (req, res, next) => rulesController.createRule(req as any, res, next));
router.patch('/:id', (req, res, next) => rulesController.updateRule(req as any, res, next));
router.delete('/:id', (req, res, next) => rulesController.deleteRule(req as any, res, next));

export default router;
