import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { diskUpload } from '../../middleware/upload';
import { expensesController } from './expenses.controller';

const router = Router();

router.use(authenticate);

// Submit expense with optional receipt upload
router.post('/', diskUpload.single('receipt'), (req, res, next) => expensesController.createExpense(req as any, res, next));
router.get('/mine', (req, res, next) => expensesController.getMyExpenses(req as any, res, next));
router.get('/', authorize('admin', 'manager'), (req, res, next) => expensesController.getAllExpenses(req as any, res, next));
router.get('/:id', (req, res, next) => expensesController.getExpenseById(req as any, res, next));

export default router;
