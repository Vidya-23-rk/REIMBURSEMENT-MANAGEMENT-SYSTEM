import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { approvalsController } from './approvals.controller';

const router = Router();

router.use(authenticate);

router.get('/pending', authorize('admin', 'manager'), (req, res, next) =>
  approvalsController.getPendingApprovals(req as any, res, next));

router.post('/:id/approve', authorize('admin', 'manager'), (req, res, next) =>
  approvalsController.approve(req as any, res, next));

router.post('/:id/reject', authorize('admin', 'manager'), (req, res, next) =>
  approvalsController.reject(req as any, res, next));

router.post('/override/:expenseId', authorize('admin'), (req, res, next) =>
  approvalsController.adminOverride(req as any, res, next));

export default router;
