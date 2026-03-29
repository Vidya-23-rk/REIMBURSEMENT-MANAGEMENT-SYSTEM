import { useState, useEffect, useCallback } from 'react';
import { expensesApi } from '../api/expenses.api';
import useExpenseStore from '../store/expenseStore';
import type { ExpenseFilters } from '../types';

export function useExpenses(filters?: ExpenseFilters, myOnly: boolean = true) {
  const { expenses, setExpenses, isLoading, setLoading } = useExpenseStore();
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = myOnly
        ? await expensesApi.getMyExpenses(filters)
        : await expensesApi.getAllExpenses(filters);
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.category, myOnly]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, isLoading, error, refetch: fetchExpenses };
}
