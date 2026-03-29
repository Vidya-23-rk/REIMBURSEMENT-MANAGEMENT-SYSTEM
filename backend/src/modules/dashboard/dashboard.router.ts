import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate);

// GET /dashboard — returns role-specific stats
router.get('/', (req, res, next) => dashboardController.getStats(req as any, res, next));

export default router;
