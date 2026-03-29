export interface ApprovalRequest {
  id: string;
  expenseId: string;
  approverId: string;
  ruleId: string;
  stepOrder: number;
  status: ApprovalStatus;
  comment: string | null;
  decidedAt: string | null;
  approver?: {
    id: string;
    name: string;
  };
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovePayload {
  comment?: string;
}

export interface RejectPayload {
  comment: string;
}

export interface OverridePayload {
  action: 'approved' | 'rejected';
  comment: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  minAmount?: number;
  maxAmount?: number;
  ruleType: 'percentage' | 'specific' | 'hybrid';
  percentageThreshold?: number;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  order: number;
  approverType: 'manager' | 'specific_user';
  approverId?: string;
}

export interface CreateRulePayload {
  name: string;
  minAmount?: number;
  maxAmount?: number;
  ruleType: 'percentage' | 'specific' | 'hybrid';
  percentageThreshold?: number;
  steps: ApprovalStep[];
}
