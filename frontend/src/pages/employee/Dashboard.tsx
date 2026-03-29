import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import {
  Receipt,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  DollarSign,
  Loader2,
} from 'lucide-react';

interface EmployeeData {
  role: string;
  overview: {
    totalSubmitted: number;
    pending: number;
    approved: number;
    rejected: number;
    totalApprovedAmount: number;
  };
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    amountInBase: number;
    status: string;
    category: string;
    createdAt: string;
  }>;
}

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => {
      setData(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const o = data?.overview;
  const totalAmount = data?.recentExpenses?.reduce((s, e) => s + Number(e.amountInBase || e.amount), 0) ?? 0;

  const stats = [
    {
      label: 'Total Submitted',
      value: String(o?.totalSubmitted ?? 0),
      change: `${o?.pending ?? 0} pending`,
      icon: <Receipt className="w-5 h-5" />,
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Approved',
      value: String(o?.approved ?? 0),
      change: o?.totalSubmitted ? `${Math.round(((o.approved ?? 0) / o.totalSubmitted) * 100)}%` : '0%',
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Pending',
      value: String(o?.pending ?? 0),
      change: 'Awaiting review',
      icon: <Clock className="w-5 h-5" />,
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
    {
      label: 'Approved Amount',
      value: `₹${(o?.totalApprovedAmount ?? 0).toLocaleString()}`,
      change: `Total: ₹${totalAmount.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      bgLight: 'bg-accent-50',
      textColor: 'text-accent-600',
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'pending': return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      case 'in_progress': return 'badge-in-progress';
      default: return 'badge';
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="page-subtitle">
          Here's a summary of your expense activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card p-5 hover:shadow-glow transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bgLight} flex items-center justify-center ${stat.textColor}`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-300" />
            </div>
            <p className="text-2xl font-bold font-display text-surface-900 mb-1">{stat.value}</p>
            <p className="text-xs text-surface-400 font-medium">{stat.label}</p>
            <p className="text-xs text-surface-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Expenses */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100">
          <h2 className="text-lg font-display font-bold text-surface-900">Recent Expenses</h2>
          <p className="text-sm text-surface-400">Your latest submissions</p>
        </div>
        <div className="divide-y divide-surface-50">
          {(data?.recentExpenses ?? []).map((expense, i) => (
            <div
              key={expense.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-surface-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{expense.description}</p>
                  <p className="text-xs text-surface-400">{expense.category} · {new Date(expense.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-surface-700 font-mono">
                  {expense.currency} {expense.amount.toLocaleString()}
                </span>
                <span className={getStatusStyles(expense.status)}>
                  {expense.status === 'in_progress' ? 'In Progress' : expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
          {(data?.recentExpenses ?? []).length === 0 && (
            <div className="px-6 py-8 text-center text-surface-400 text-sm">
              No expenses yet — submit your first! 🚀
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
