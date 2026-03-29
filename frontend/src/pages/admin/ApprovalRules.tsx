import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { rulesApi } from '../../api/rules.api';
import { usersApi } from '../../api/users.api';
import type { ApprovalRule, CreateRulePayload, User } from '../../types';
import toast from 'react-hot-toast';

export default function ApprovalRules() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [isSequential, setIsSequential] = useState(true);

  const [form, setForm] = useState<CreateRulePayload>({
    name: '',
    minAmount: 0,
    maxAmount: undefined,
    ruleType: 'percentage',
    percentageThreshold: 100,
    steps: [{ order: 1, approverType: 'manager' }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, usersData] = await Promise.all([rulesApi.getAll(), usersApi.getAll()]);
      setRules(rulesData);
      setUsers(usersData);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm({
      name: '',
      minAmount: 0,
      maxAmount: undefined,
      ruleType: 'percentage',
      percentageThreshold: 100,
      steps: [{ order: 1, approverType: 'manager' }],
    });
    setIsSequential(true);
    setShowModal(true);
  };

  const openEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      minAmount: rule.minAmount,
      maxAmount: rule.maxAmount,
      ruleType: rule.ruleType,
      percentageThreshold: rule.percentageThreshold,
      steps: [...rule.steps],
    });
    setIsSequential(true);
    setShowModal(true);
  };

  const addStep = () => {
    setForm({
      ...form,
      steps: [...form.steps, { order: form.steps.length + 1, approverType: 'specific_user', approverId: '' }],
    });
  };

  const removeStep = (idx: number) => {
    const newSteps = form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    setForm({ ...form, steps: newSteps });
  };

  const updateStep = (idx: number, field: string, value: string) => {
    const newSteps = [...form.steps];
    (newSteps[idx] as any)[field] = value;
    setForm({ ...form, steps: newSteps });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    const payload = {
      ...form,
      steps: form.steps.map(s => ({
        approverId: (s as any).approverId || undefined,
        approverType: (s as any).approverType === 'specific_user' ? 'specific' : 'manager',
        stepOrder: (s as any).order,
      }))
    };

    try {
      if (editingRule) {
        await rulesApi.update(editingRule.id, payload as any);
        toast.success('Rule updated');
      } else {
        await rulesApi.create(payload as any);
        toast.success('Rule created');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await rulesApi.delete(id);
      toast.success('Rule deleted');
      loadData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary-600" />
            Approval Rules
          </h1>
          <p className="page-subtitle">Configure expense approval workflows</p>
        </div>
        <button onClick={openCreate} className="btn-primary" id="new-rule-btn">
          <Plus className="w-5 h-5" /> New Rule
        </button>
      </div>

      {/* Rules cards */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="card p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : rules.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
              <Settings className="w-7 h-7 text-surface-300" />
            </div>
            <p className="text-surface-600 font-semibold">No approval rules configured</p>
            <p className="text-surface-400 text-sm mt-1">Create your first rule to set up approval workflows</p>
          </div>
        ) : (
          rules.map((rule, i) => (
            <div
              key={rule.id}
              className="card p-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-surface-900">{rule.name}</h3>
                  <p className="text-sm text-surface-400 mt-1">
                    {rule.ruleType.charAt(0).toUpperCase() + rule.ruleType.slice(1)} rule
                    {rule.minAmount != null && ` · Min: ₹${rule.minAmount.toLocaleString()}`}
                    {rule.maxAmount != null && ` · Max: ₹${rule.maxAmount.toLocaleString()}`}
                    {rule.percentageThreshold != null && ` · ${rule.percentageThreshold}% threshold`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(rule)} className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Approval steps visualization */}
              <div className="flex items-center gap-2 flex-wrap">
                {rule.steps.map((step, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-surface-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                        {step.order}
                      </div>
                      <span className="text-sm text-surface-700 font-medium">
                        {step.approverType === 'manager' ? 'Direct Manager' : users.find((u) => u.id === step.approverId)?.name || 'Specific User'}
                      </span>
                    </div>
                    {si < rule.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-surface-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal — matching wireframe's approval rule builder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-surface-900">
                {editingRule ? 'Edit Rule' : 'New Approval Rule'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Rule name & description */}
              <div>
                <label className="input-label">Rule Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Standard Expense (< ₹50,000)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Rule type */}
              <div>
                <label className="input-label">Rule Type</label>
                <select
                  className="input-field"
                  value={form.ruleType}
                  onChange={(e) => setForm({ ...form, ruleType: e.target.value as any })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="specific">Specific</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Amount range — matching wireframe's Min/Max percentage fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Minimum Amount</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={form.minAmount || ''}
                    onChange={(e) => setForm({ ...form, minAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="input-label">Maximum Amount</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="No limit"
                    value={form.maxAmount || ''}
                    onChange={(e) => setForm({ ...form, maxAmount: parseFloat(e.target.value) || undefined })}
                  />
                </div>
              </div>

              {form.ruleType !== 'specific' && (
                <div>
                  <label className="input-label">Percentage Threshold (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="100"
                    value={form.percentageThreshold || ''}
                    onChange={(e) => setForm({ ...form, percentageThreshold: parseFloat(e.target.value) })}
                  />
                </div>
              )}

              {/* Approvers Sequence — matching wireframe */}
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                <input
                  type="checkbox"
                  id="sequential-checkbox"
                  checked={isSequential}
                  onChange={(e) => setIsSequential(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-surface-300"
                />
                <label htmlFor="sequential-checkbox" className="text-sm text-surface-700 font-medium">
                  Approvers Sequence — If checked, approvals happen in order. Otherwise, all approvers get the request simultaneously.
                </label>
              </div>

              {/* Approver steps — matching wireframe's numbered approver list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="input-label mb-0">Approvers</label>
                  <button onClick={addStep} className="text-xs text-primary-600 font-semibold hover:text-primary-700">
                    + Add Approver
                  </button>
                </div>
                <div className="space-y-2">
                  {form.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-surface-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {step.order}
                      </div>
                      <select
                        className="input-field text-sm py-2"
                        value={step.approverType}
                        onChange={(e) => updateStep(i, 'approverType', e.target.value)}
                      >
                        <option value="manager">Direct Manager</option>
                        <option value="specific_user">Specific User</option>
                      </select>
                      {step.approverType === 'specific_user' && (
                        <select
                          className="input-field text-sm py-2"
                          value={step.approverId || ''}
                          onChange={(e) => updateStep(i, 'approverId', e.target.value)}
                        >
                          <option value="">Select user</option>
                          {users.filter((u) => u.role !== 'employee').map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      )}
                      {form.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(i)}
                          className="p-1.5 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-500 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-surface-100">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingRule ? 'Save Changes' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
