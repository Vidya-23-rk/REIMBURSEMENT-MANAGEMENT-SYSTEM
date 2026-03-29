import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { expensesService } from './expenses.service';
import { successResponse, errorResponse } from '../../utils/response';

export class ExpensesController {
  async createExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { amount, currency, category, description, expenseDate } = req.body;

      if (!amount || !currency || !category || !description || !expenseDate) {
        errorResponse(res, 'Amount, currency, category, description, and expenseDate are required.', 400);
        return;
      }

      // Build receiptUrl from uploaded file (if any)
      const receiptUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.receiptUrl || undefined);

      const expense = await expensesService.createExpense(
        req.user!.userId,
        req.user!.companyId,
        { amount: parseFloat(amount), currency, category, description, expenseDate, receiptUrl }
      );
      successResponse(res, expense, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const expenses = await expensesService.getMyExpenses(req.user!.userId, status);
      successResponse(res, expenses);
    } catch (error) {
      next(error);
    }
  }

  async getAllExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, category, page, limit } = req.query;
      const result = await expensesService.getAllExpenses(req.user!.companyId, {
        status: status as string,
        category: category as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expenseId = req.params.id as string;
      const expense = await expensesService.getExpenseById(expenseId, req.user!.companyId);
      successResponse(res, expense);
    } catch (error) {
      next(error);
    }
  }
}

export const expensesController = new ExpensesController();
