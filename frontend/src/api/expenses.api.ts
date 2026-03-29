import api from './axios';
import { mockExpenses } from './mock';
import type { Expense, CreateExpensePayload, ExpenseFilters, OCRResult } from '../types';
import { USE_MOCK } from '../config';


export const expensesApi = {
  getMyExpenses: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      let result = [...mockExpenses].filter((e) => e.submittedBy === 'u3');
      if (filters?.status) result = result.filter((e) => e.status === filters.status);
      return result;
    }
    const { data } = await api.get<{ success: true; data: Expense[] }>('/expenses/mine', { params: filters });
    return data.data;
  },

  getAllExpenses: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      let result = [...mockExpenses];
      if (filters?.status) result = result.filter((e) => e.status === filters.status);
      if (filters?.category) result = result.filter((e) => e.category === filters.category);
      return result;
    }
    const { data } = await api.get<{ success: true; data: { expenses: Expense[]; total: number; page: number; pages: number } }>('/expenses', { params: filters });
    return data.data.expenses;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const expense = mockExpenses.find((e) => e.id === id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }
    const { data } = await api.get<{ success: true; data: Expense }>(`/expenses/${id}`);
    return data.data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const newExpense: Expense = {
        id: `e${Date.now()}`,
        submittedBy: 'u3',
        companyId: 'c1',
        amount: payload.amount,
        currency: payload.currency,
        amountInBase: payload.amount * 83.5,
        category: payload.category,
        description: payload.description,
        expenseDate: payload.expenseDate,
        receiptUrl: null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        submitter: { id: 'u3', name: 'Charlie Davis', email: 'charlie@acme.com' },
        approvalRequests: [],
      };
      mockExpenses.unshift(newExpense);
      return newExpense;
    }

    // If receipt file attached, use FormData (multipart); otherwise JSON
    if (payload.receipt) {
      const formData = new FormData();
      formData.append('receipt', payload.receipt);
      formData.append('amount', String(payload.amount));
      formData.append('currency', payload.currency);
      formData.append('category', payload.category);
      formData.append('description', payload.description);
      formData.append('expenseDate', payload.expenseDate);
      const { data } = await api.post<{ success: true; data: Expense }>('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    }

    const { receipt, ...jsonPayload } = payload;
    const { data } = await api.post<{ success: true; data: Expense }>('/expenses', jsonPayload);
    return data.data;
  },

  scanReceipt: async (_file: File): Promise<OCRResult> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1500));
      return {
        amount: 1250.00,
        currency: 'INR',
        category: 'Meals',
        description: 'Business lunch at Grand Hotel',
        date: new Date().toISOString().split('T')[0],
        vendor: 'Grand Hotel Restaurant',
      };
    }
    const formData = new FormData();
    formData.append('receipt', _file);
    const { data } = await api.post<{ success: true; data: OCRResult }>('/ocr/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
