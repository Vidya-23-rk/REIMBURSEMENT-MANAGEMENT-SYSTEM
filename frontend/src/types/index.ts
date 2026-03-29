export type { User, CreateUserPayload, UpdateUserPayload, UserRole } from './user';
export type { 
  Expense, 
  ExpenseStatus, 
  CreateExpensePayload, 
  ExpenseFilters, 
  ExpenseCategory,
  OCRResult,
  CurrencyInfo,
  CurrencyRates,
} from './expense';
export { EXPENSE_CATEGORIES } from './expense';
export type { 
  ApprovalRequest, 
  ApprovalStatus, 
  ApprovePayload, 
  RejectPayload, 
  OverridePayload,
  ApprovalRule,
  ApprovalStep,
  CreateRulePayload,
} from './approval';

// Generic API response types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface AuthResponse {
  token: string;
  user: import('./user').User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
