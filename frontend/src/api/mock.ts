/**
 * Mock data for frontend development without backend.
 * This allows Person B to build & test all UI independently.
 * During Hour 6 integration, switch to real API calls.
 */

import type { User, Expense, ApprovalRequest, ApprovalRule, CurrencyInfo } from '../types';

// ─── Mock Users ─────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@acme.com',
    role: 'admin',
    companyId: 'c1',
    managerId: null,
    isManagerApprover: false,
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@acme.com',
    role: 'manager',
    companyId: 'c1',
    managerId: 'u1',
    isManagerApprover: true,
  },
  {
    id: 'u3',
    name: 'Charlie Davis',
    email: 'charlie@acme.com',
    role: 'employee',
    companyId: 'c1',
    managerId: 'u2',
    isManagerApprover: false,
  },
  {
    id: 'u4',
    name: 'Diana Patel',
    email: 'diana@acme.com',
    role: 'employee',
    companyId: 'c1',
    managerId: 'u2',
    isManagerApprover: false,
  },
];

// Default mock logged-in user (employee)
export const mockCurrentUser: User = mockUsers[2];

// ─── Mock Expenses ──────────────────────────────────────────
export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    submittedBy: 'u3',
    companyId: 'c1',
    amount: 250.00,
    currency: 'USD',
    amountInBase: 20875.00,
    category: 'Travel',
    description: 'Flight to client meeting in Mumbai',
    expenseDate: '2026-03-15',
    receiptUrl: null,
    status: 'approved',
    createdAt: '2026-03-15T10:30:00Z',
    submitter: { id: 'u3', name: 'Charlie Davis', email: 'charlie@acme.com' },
    approvalRequests: [
      {
        id: 'ar1',
        expenseId: 'e1',
        approverId: 'u2',
        ruleId: 'r1',
        stepOrder: 1,
        status: 'approved',
        comment: 'Approved — necessary client visit',
        decidedAt: '2026-03-16T09:00:00Z',
        approver: { id: 'u2', name: 'Bob Smith' },
      },
    ],
  },
  {
    id: 'e2',
    submittedBy: 'u3',
    companyId: 'c1',
    amount: 45.50,
    currency: 'USD',
    amountInBase: 3799.25,
    category: 'Meals',
    description: 'Lunch with design team',
    expenseDate: '2026-03-20',
    receiptUrl: null,
    status: 'pending',
    createdAt: '2026-03-20T13:15:00Z',
    submitter: { id: 'u3', name: 'Charlie Davis', email: 'charlie@acme.com' },
    approvalRequests: [
      {
        id: 'ar2',
        expenseId: 'e2',
        approverId: 'u2',
        ruleId: 'r1',
        stepOrder: 1,
        status: 'pending',
        comment: null,
        decidedAt: null,
        approver: { id: 'u2', name: 'Bob Smith' },
      },
    ],
  },
  {
    id: 'e3',
    submittedBy: 'u3',
    companyId: 'c1',
    amount: 1200.00,
    currency: 'USD',
    amountInBase: 100200.00,
    category: 'Hardware',
    description: 'MacBook charger and USB-C hub',
    expenseDate: '2026-03-22',
    receiptUrl: null,
    status: 'in_progress',
    createdAt: '2026-03-22T11:00:00Z',
    submitter: { id: 'u3', name: 'Charlie Davis', email: 'charlie@acme.com' },
    approvalRequests: [
      {
        id: 'ar3',
        expenseId: 'e3',
        approverId: 'u2',
        ruleId: 'r2',
        stepOrder: 1,
        status: 'approved',
        comment: 'Equipment needed',
        decidedAt: '2026-03-23T08:30:00Z',
        approver: { id: 'u2', name: 'Bob Smith' },
      },
      {
        id: 'ar4',
        expenseId: 'e3',
        approverId: 'u1',
        ruleId: 'r2',
        stepOrder: 2,
        status: 'pending',
        comment: null,
        decidedAt: null,
        approver: { id: 'u1', name: 'Alice Johnson' },
      },
    ],
  },
  {
    id: 'e4',
    submittedBy: 'u4',
    companyId: 'c1',
    amount: 85.00,
    currency: 'EUR',
    amountInBase: 7650.00,
    category: 'Software',
    description: 'Annual Figma subscription',
    expenseDate: '2026-03-18',
    receiptUrl: null,
    status: 'rejected',
    createdAt: '2026-03-18T16:00:00Z',
    submitter: { id: 'u4', name: 'Diana Patel', email: 'diana@acme.com' },
    approvalRequests: [
      {
        id: 'ar5',
        expenseId: 'e4',
        approverId: 'u2',
        ruleId: 'r1',
        stepOrder: 1,
        status: 'rejected',
        comment: 'Company already has Figma enterprise license',
        decidedAt: '2026-03-19T10:00:00Z',
        approver: { id: 'u2', name: 'Bob Smith' },
      },
    ],
  },
  {
    id: 'e5',
    submittedBy: 'u4',
    companyId: 'c1',
    amount: 320.00,
    currency: 'USD',
    amountInBase: 26720.00,
    category: 'Training',
    description: 'React Advanced Patterns workshop',
    expenseDate: '2026-03-25',
    receiptUrl: null,
    status: 'pending',
    createdAt: '2026-03-25T09:00:00Z',
    submitter: { id: 'u4', name: 'Diana Patel', email: 'diana@acme.com' },
    approvalRequests: [
      {
        id: 'ar6',
        expenseId: 'e5',
        approverId: 'u2',
        ruleId: 'r1',
        stepOrder: 1,
        status: 'pending',
        comment: null,
        decidedAt: null,
        approver: { id: 'u2', name: 'Bob Smith' },
      },
    ],
  },
];

// ─── Mock Approval Rules ────────────────────────────────────
export const mockRules: ApprovalRule[] = [
  {
    id: 'r1',
    name: 'Standard Expense (< $500)',
    minAmount: 0,
    maxAmount: 500,
    ruleType: 'percentage',
    percentageThreshold: 100,
    steps: [{ order: 1, approverType: 'manager' }],
  },
  {
    id: 'r2',
    name: 'High Value Expense ($500+)',
    minAmount: 500,
    maxAmount: undefined,
    ruleType: 'specific',
    steps: [
      { order: 1, approverType: 'manager' },
      { order: 2, approverType: 'specific_user', approverId: 'u1' },
    ],
  },
];

// ─── Mock Currencies ────────────────────────────────────────
export const mockCurrencies: CurrencyInfo[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

export const mockRates: Record<string, number> = {
  INR: 1,
  USD: 0.01198,
  EUR: 0.01101,
  GBP: 0.00949,
  JPY: 1.7893,
  AUD: 0.01847,
  CAD: 0.01631,
  SGD: 0.01596,
};

// ─── Mock Pending Approvals (for Manager view) ──────────────
export const mockPendingApprovals: ApprovalRequest[] = mockExpenses
  .flatMap((e) => e.approvalRequests || [])
  .filter((ar) => ar.status === 'pending');

// ─── Mock Auth Token ────────────────────────────────────────
export const mockToken = 'mock-jwt-token-for-development';
