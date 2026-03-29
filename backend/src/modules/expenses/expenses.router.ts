import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { diskUpload } from '../../middleware/upload';
import { expensesController } from './expenses.controller';

const router = Router();

router.use(authenticate);

// Submit expense — accepts both JSON and multipart/form-data (with receipt file)
router.post('/', (req, res, next) => {
  // If it's a multipart request, process the file upload first
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    diskUpload.single('receipt')(req, res, (err: any) => {
      if (err) return next(err);
      expensesController.createExpense(req as any, res, next);
    });
  } else {
    expensesController.createExpense(req as any, res, next);
  }
});

// My expenses — supports ?status=&search=&dateFrom=&dateTo=
router.get('/mine', (req, res, next) => expensesController.getMyExpenses(req as any, res, next));

// CSV export (admin/manager) — supports ?status=&dateFrom=&dateTo=
router.get('/export', authorize('admin', 'manager'), (req, res, next) => expensesController.exportCsv(req as any, res, next));

// All expenses (admin/manager) — supports ?status=&category=&search=&dateFrom=&dateTo=&page=&limit=
router.get('/', authorize('admin', 'manager'), (req, res, next) => expensesController.getAllExpenses(req as any, res, next));

// Single expense by ID
router.get('/:id', (req, res, next) => expensesController.getExpenseById(req as any, res, next));

export default router;
