import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { approvalsApi } from '../../api/approvals.api';
import { expensesApi } from '../../api/expenses.api';
import StatusBadge from '../../components/StatusBadge';
import type { Expense } from '../../types';
import toast from 'react-hot-toast';

export default function PendingApprovals() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; expenseDesc: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    loadPendingExpenses();
  }, []);

  const loadPendingExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expensesApi.getAllExpenses({ status: 'pending' });
      const inProgress = await expensesApi.getAllExpenses({ status: 'in_progress' });
      setExpenses([...data, ...inProgress]);
    } catch {
      toast.error('Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalId: string, _expenseId: string) => {
    setActionLoading(approvalId);
    try {
      await approvalsApi.approve(approvalId, { comment: 'Approved' });
      toast.success('Expense approved');
      loadPendingExpenses();
    } catch {
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectComment.trim()) {
      toast.error('Please provide a comment for rejection');
      return;
    }
    setActionLoading(rejectModal.id);
    try {
      await approvalsApi.reject(rejectModal.id, { comment: rejectComment });
      toast.success('Expense rejected');
      setRejectModal(null);
      setRejectComment('');
      loadPendingExpenses();
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-3">
          <AlertCircle className="w-7 h-7 text-warning-500" />
          Approvals
        </h1>
        <p className="page-subtitle">Review and approve/reject pending expense requests</p>
      </div>

      {/* Approvals table — matching wireframe's Manager View table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            <p className="text-surface-400 text-sm mt-3">Loading pending approvals...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-success-400" />
            </div>
            <p className="text-surface-600 font-semibold">All caught up!</p>
            <p className="text-surface-400 text-sm mt-1">No pending approvals at this time</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Approval Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Request Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Request Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Total Amount<br/><span className="normal-case font-normal">(in company's currency)</span></th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {expenses.map((expense, i) => {
                  const pendingApproval = expense.approvalRequests?.find((a) => a.status === 'pending');
                  const isActioned = !pendingApproval;

                  return (
                    <tr
                      key={expense.id}
                      className={`transition-colors animate-slide-up ${isActioned ? 'bg-surface-50/50 opacity-60' : 'hover:bg-surface-50/60'}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-surface-800 truncate max-w-[250px]">
                          {expense.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                            {expense.submitter?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm text-surface-700 font-medium">
                            {expense.submitter?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-50 text-xs font-semibold text-surface-600">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={expense.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div>
                          <span className="text-xs text-surface-400 font-mono">
                            {expense.currency !== 'INR' ? `${expense.currency} ${expense.amount.toLocaleString()}` : ''}
                          </span>
                          {expense.currency !== 'INR' && <span className="text-xs text-surface-300 mx-1">≈</span>}
                          <span className="text-sm font-bold text-surface-800 font-mono">
                            ₹{expense.amountInBase.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* Buttons hidden once actioned — matching wireframe requirement */}
                        {pendingApproval && !isActioned ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(pendingApproval.id, expense.id)}
                              disabled={actionLoading === pendingApproval.id}
                              className="btn-success text-xs px-4 py-1.5"
                            >
                              {actionLoading === pendingApproval.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: pendingApproval.id, expenseDesc: expense.description })}
                              disabled={actionLoading === pendingApproval.id}
                              className="btn-danger text-xs px-4 py-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-400 italic">
                            {expense.status === 'approved' ? '✓ Approved' : expense.status === 'rejected' ? '✗ Rejected' : 'Awaiting'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-display font-bold text-surface-900 mb-2">Reject Expense</h3>
            <p className="text-sm text-surface-500 mb-4">
              Please provide a reason for rejecting: <strong>{rejectModal.expenseDesc}</strong>
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="input-field min-h-[100px] resize-none mb-4"
              id="reject-comment"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectComment.trim() || actionLoading === rejectModal.id}
                className="btn-danger"
              >
                {actionLoading === rejectModal.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Reject Expense'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
