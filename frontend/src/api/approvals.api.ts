import api from './axios';
import { mockExpenses, mockPendingApprovals } from './mock';
import type { ApprovalRequest, ApprovePayload, RejectPayload, OverridePayload } from '../types';
import { USE_MOCK } from '../config';


export const approvalsApi = {
  getPendingApprovals: async (): Promise<ApprovalRequest[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockPendingApprovals;
    }
    const { data } = await api.get<{ success: true; data: ApprovalRequest[] }>('/approvals/pending');
    return data.data;
  },

  approve: async (id: string, payload?: ApprovePayload): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      // Update mock data
      for (const expense of mockExpenses) {
        const ar = expense.approvalRequests?.find((a) => a.id === id);
        if (ar) {
          ar.status = 'approved';
          ar.comment = payload?.comment || null;
          ar.decidedAt = new Date().toISOString();
          // Check if all approvals are done
          const allApproved = expense.approvalRequests?.every((a) => a.status === 'approved');
          if (allApproved) expense.status = 'approved';
          else expense.status = 'in_progress';
          break;
        }
      }
      return;
    }
    await api.post(`/approvals/${id}/approve`, payload);
  },

  reject: async (id: string, payload: RejectPayload): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      for (const expense of mockExpenses) {
        const ar = expense.approvalRequests?.find((a) => a.id === id);
        if (ar) {
          ar.status = 'rejected';
          ar.comment = payload.comment;
          ar.decidedAt = new Date().toISOString();
          expense.status = 'rejected';
          break;
        }
      }
      return;
    }
    await api.post(`/approvals/${id}/reject`, payload);
  },

  override: async (expenseId: string, payload: OverridePayload): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const expense = mockExpenses.find((e) => e.id === expenseId);
      if (expense) {
        expense.status = payload.action;
        expense.approvalRequests?.forEach((ar) => {
          ar.status = payload.action === 'approved' ? 'approved' : 'rejected';
          ar.comment = payload.comment;
          ar.decidedAt = new Date().toISOString();
        });
      }
      return;
    }
    await api.post(`/approvals/override/${expenseId}`, payload);
  },
};
