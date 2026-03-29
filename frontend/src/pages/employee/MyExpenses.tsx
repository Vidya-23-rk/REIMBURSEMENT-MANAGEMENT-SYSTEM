import { useState } from 'react';
import {
  Receipt,
  Eye,
  Calendar,
  Tag,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { useExpenses } from '../../hooks/useExpenses';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import ApprovalTimeline from '../../components/ApprovalTimeline';
import type { Expense, ExpenseStatus } from '../../types';
import toast from 'react-hot-toast';

export default function MyExpenses() {
  const user = useAuthStore((s) => s.user);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | undefined>();
  const { expenses, isLoading } = useExpenses({ status: statusFilter }, !isAdminOrManager);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/expenses/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const filters: { label: string; value: ExpenseStatus | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{isAdminOrManager ? 'All Expenses' : 'My Expenses'}</h1>
          <p className="page-subtitle">
            {isAdminOrManager ? 'View all expense submissions across the company' : 'Track your submitted expense reimbursements'}
          </p>
        </div>
        {isAdminOrManager && (
          <button onClick={handleExportCsv} className="btn-ghost flex items-center gap-2" id="export-csv-btn">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Filters — matching wireframe's status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === f.value
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                : 'bg-white text-surface-500 border border-surface-200 hover:bg-surface-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Expense table — matching wireframe's columns */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            <p className="text-surface-400 text-sm mt-3">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7 text-surface-300" />
            </div>
            <p className="text-surface-600 font-semibold">No expenses found</p>
            <p className="text-surface-400 text-sm mt-1">Submit your first expense to see it here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Paid By</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {expenses.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-surface-50/60 transition-colors animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-surface-800 truncate max-w-[250px]">
                        {expense.description}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-surface-600">
                        {new Date(expense.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-50 text-xs font-semibold text-surface-600">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-surface-600">Self</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-bold text-surface-800 font-mono">
                        {expense.currency === 'INR' ? '₹' : expense.currency + ' '}{expense.amount.toLocaleString('en-IN')}
                      </p>
                      {expense.currency !== 'INR' && (
                        <p className="text-xs text-surface-400 font-mono">
                          ≈ ₹{expense.amountInBase.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedExpense(expense)}
                        className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Detail Drawer — matches wireframe's detail view with approval history */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={() => setSelectedExpense(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-display font-bold text-surface-900">Expense Details</h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-2 rounded-lg hover:bg-surface-100 text-surface-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedExpense.status} />
                <span className="text-xs text-surface-400">
                  Submitted {new Date(selectedExpense.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Amount card */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white">
                <p className="text-sm text-white/70 mb-1">Total Amount</p>
                <p className="text-3xl font-bold font-mono">
                  {selectedExpense.currency === 'INR' ? '₹' : selectedExpense.currency + ' '}{selectedExpense.amount.toLocaleString('en-IN')}
                </p>
                {selectedExpense.currency !== 'INR' && (
                  <p className="text-sm text-white/60 mt-1">
                    ≈ ₹{selectedExpense.amountInBase.toLocaleString('en-IN')} INR
                  </p>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Description
                  </p>
                  <p className="text-sm font-semibold text-surface-800">{selectedExpense.description}</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="text-sm font-semibold text-surface-800">
                    {new Date(selectedExpense.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Category
                  </p>
                  <p className="text-sm font-semibold text-surface-800">{selectedExpense.category}</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 mb-1">Paid By</p>
                  <p className="text-sm font-semibold text-surface-800">Self</p>
                </div>
              </div>

              {/* Approval History — matching wireframe's Approver/Status/Time table */}
              <div>
                <h4 className="text-sm font-bold text-surface-700 mb-4 uppercase tracking-wider">
                  Approval History
                </h4>
                <ApprovalTimeline approvals={selectedExpense.approvalRequests || []} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
