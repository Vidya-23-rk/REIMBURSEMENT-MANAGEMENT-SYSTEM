import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { expensesService } from './expenses.service';
import { successResponse, errorResponse } from '../../utils/response';

export class ExpensesController {
  async createExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // receiptUrl from uploaded file or body
      const receiptUrl = req.file
        ? `/uploads/${req.file.filename}`
        : (req.body.receiptUrl || undefined);

      const expense = await expensesService.createExpense(
        req.user!.userId,
        req.user!.companyId,
        { ...req.body, amount: parseFloat(req.body.amount), receiptUrl }
      );
      successResponse(res, expense, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, dateFrom, dateTo } = req.query as Record<string, string>;
      const expenses = await expensesService.getMyExpenses(req.user!.userId, {
        status, search, dateFrom, dateTo,
      });
      successResponse(res, expenses);
    } catch (error) {
      next(error);
    }
  }

  async getAllExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, category, search, dateFrom, dateTo, page, limit } = req.query as Record<string, string>;
      const result = await expensesService.getAllExpenses(req.user!.companyId, {
        status, category, search, dateFrom, dateTo,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expense = await expensesService.getExpenseById(req.params.id, req.user!.companyId);
      successResponse(res, expense);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, dateFrom, dateTo } = req.query as Record<string, string>;
      const csv = await expensesService.exportCsv(req.user!.companyId, {
        status, dateFrom, dateTo,
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=expenses-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const expensesController = new ExpensesController();
