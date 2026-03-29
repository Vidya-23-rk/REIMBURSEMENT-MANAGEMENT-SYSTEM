import type { ApprovalRequest } from './approval';

export interface Expense {
  id: string;
  submittedBy: string;
  companyId: string;
  amount: number;
  currency: string;
  amountInBase: number;
  category: string;
  description: string;
  expenseDate: string;
  receiptUrl: string | null;
  status: ExpenseStatus;
  createdAt: string;
  submitter?: {
    id: string;
    name: string;
    email: string;
  };
  approvalRequests?: ApprovalRequest[];
}

export type ExpenseStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';

export interface CreateExpensePayload {
  amount: number;
  currency: string;
  category: string;
  description: string;
  expenseDate: string;
}

export interface ExpenseFilters {
  status?: ExpenseStatus;
  category?: string;
  page?: number;
  limit?: number;
}

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Hardware',
  'Accommodation',
  'Transportation',
  'Communication',
  'Training',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface OCRResult {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  vendor: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export interface CurrencyRates {
  rates: Record<string, number>;
}
