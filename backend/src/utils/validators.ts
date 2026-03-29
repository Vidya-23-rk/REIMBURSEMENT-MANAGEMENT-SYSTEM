import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  country: z.string().min(2).max(100).optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code (e.g., INR, USD)').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ─── User Schemas ───────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['admin', 'manager', 'employee']),
  managerId: z.string().uuid().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  managerId: z.string().uuid().optional().nullable(),
  isManagerApprover: z.boolean().optional(),
});

// ─── Expense Schemas ────────────────────────────────────

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0').max(100000000, 'Amount too large'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  category: z.string().min(2).max(50),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  receiptUrl: z.string().url().optional(),
});

// ─── Rule Schemas ───────────────────────────────────────

export const createRuleSchema = z.object({
  name: z.string().min(2).max(200),
  minAmount: z.coerce.number().nonnegative().optional().nullable(),
  maxAmount: z.coerce.number().positive().optional().nullable(),
  ruleType: z.enum(['none', 'percentage', 'specific', 'hybrid']),
  percentageThreshold: z.number().min(1).max(100).optional().nullable(),
  steps: z.array(z.object({
    approverId: z.string().uuid().optional().nullable(),
    approverType: z.enum(['specific', 'manager']).optional().default('specific'),
    stepOrder: z.number().int().min(1),
    isKeyApprover: z.boolean().optional(),
  })).min(1, 'At least one approval step is required'),
});

// ─── Approval Schemas ───────────────────────────────────

export const approveSchema = z.object({
  comment: z.string().max(500).optional(),
});

export const rejectSchema = z.object({
  comment: z.string().min(3, 'Rejection comment must be at least 3 characters').max(500),
});

export const overrideSchema = z.object({
  action: z.enum(['approved', 'rejected']),
  comment: z.string().min(3, 'Override comment must be at least 3 characters').max(500),
});

// ─── Password Change Schema ─────────────────────────────

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});
