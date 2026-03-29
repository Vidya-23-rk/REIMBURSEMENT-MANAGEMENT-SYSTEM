import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { companyController } from './company.controller';

const router = Router();

router.use(authenticate);

// Any authenticated user can view company info
router.get('/', (req, res, next) => companyController.getCompany(req as any, res, next));

// Only admin can update company settings
router.patch('/', authorize('admin'), (req, res, next) => companyController.updateCompany(req as any, res, next));

export default router;
