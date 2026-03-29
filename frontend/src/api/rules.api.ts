import api from './axios';
import { mockRules } from './mock';
import type { ApprovalRule, CreateRulePayload } from '../types';
import { USE_MOCK } from '../config';


const mapRule = (rule: any): ApprovalRule => ({
  ...rule,
  steps: (rule.approvalSteps || rule.steps || []).map((step: any) => ({
    order: step.stepOrder || step.order,
    approverType: step.approverType === 'specific' ? 'specific_user' : 'manager',
    approverId: step.approverId,
  })).sort((a: any, b: any) => a.order - b.order)
});

export const rulesApi = {
  getAll: async (): Promise<ApprovalRule[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return [...mockRules];
    }
    const { data } = await api.get<{ success: true; data: any[] }>('/rules');
    return data.data.map(mapRule);
  },

  create: async (payload: CreateRulePayload): Promise<ApprovalRule> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const newRule: ApprovalRule = { id: `r${Date.now()}`, ...payload };
      mockRules.push(newRule);
      return newRule;
    }
    const { data } = await api.post<{ success: true; data: any }>('/rules', payload);
    return mapRule(data.data);
  },

  update: async (id: string, payload: CreateRulePayload): Promise<ApprovalRule> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const idx = mockRules.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Rule not found');
      mockRules[idx] = { id, ...payload };
      return mockRules[idx];
    }
    const { data } = await api.patch<{ success: true; data: any }>(`/rules/${id}`, payload);
    return mapRule(data.data);
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockRules.findIndex((r) => r.id === id);
      if (idx !== -1) mockRules.splice(idx, 1);
      return;
    }
    await api.delete(`/rules/${id}`);
  },
};
