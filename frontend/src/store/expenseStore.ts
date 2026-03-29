import { create } from 'zustand';
import type { Expense, ExpenseStatus } from '../types';

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  filter: {
    status?: ExpenseStatus;
    category?: string;
    page: number;
    limit: number;
  };

  // Actions
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  setSelectedExpense: (expense: Expense | null) => void;
  setLoading: (loading: boolean) => void;
  setFilter: (filter: Partial<ExpenseState['filter']>) => void;
  resetFilter: () => void;
}

const defaultFilter = {
  page: 1,
  limit: 10,
};

const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  selectedExpense: null,
  isLoading: false,
  filter: { ...defaultFilter },

  setExpenses: (expenses) => set({ expenses }),

  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),

  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
      selectedExpense:
        state.selectedExpense?.id === id
          ? { ...state.selectedExpense, ...updates }
          : state.selectedExpense,
    })),

  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
      selectedExpense:
        state.selectedExpense?.id === id ? null : state.selectedExpense,
    })),

  setSelectedExpense: (expense) => set({ selectedExpense: expense }),

  setLoading: (isLoading) => set({ isLoading }),

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  resetFilter: () => set({ filter: { ...defaultFilter } }),
}));

export default useExpenseStore;
