import prisma from '../../config/db';
import { currencyService } from '../currency/currency.service';
import { approvalEngine } from '../approvals/approvals.engine';
import { AppError } from '../../middleware/errorHandler';

export class ExpensesService {
  async createExpense(userId: string, companyId: string, body: {
    amount: number;
    currency: string;
    category: string;
    description: string;
    expenseDate: string;
    receiptUrl?: string;
  }) {
    // Get company default currency
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new AppError('Company not found.', 404);

    // Convert to base currency
    const amountInBase = await currencyService.convert(
      body.amount,
      body.currency,
      company.currency
    );

    const expense = await prisma.expense.create({
      data: {
        submittedBy: userId,
        companyId,
        amount: body.amount,
        currency: body.currency,
        amountInBase,
        category: body.category,
        description: body.description,
        expenseDate: new Date(body.expenseDate),
        receiptUrl: body.receiptUrl || null,
        status: 'pending',
      },
      include: {
        submitter: { select: { id: true, name: true, email: true } },
      },
    });

    // Initialize approval flow
    const approvalResult = await approvalEngine.initializeApproval(
      expense.id,
      companyId,
      Number(amountInBase),
      userId
    );

    // Refetch expense with updated status and approval requests
    const updatedExpense = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        submitter: { select: { id: true, name: true, email: true } },
        approvalRequests: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return { ...updatedExpense, approvalResult };
  }

  async getMyExpenses(userId: string, status?: string) {
    return prisma.expense.findMany({
      where: {
        submittedBy: userId,
        ...(status && { status: status as any }),
      },
      include: {
        approvalRequests: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllExpenses(companyId: string, filters: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          submitter: { select: { id: true, name: true, email: true } },
          approvalRequests: {
            include: { approver: { select: { id: true, name: true } } },
            orderBy: { stepOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getExpenseById(expenseId: string, companyId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, companyId },
      include: {
        submitter: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, currency: true } },
        approvalRequests: {
          include: {
            approver: { select: { id: true, name: true } },
            rule: { select: { id: true, name: true } },
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!expense) throw new AppError('Expense not found.', 404);
    return expense;
  }
}

export const expensesService = new ExpensesService();
