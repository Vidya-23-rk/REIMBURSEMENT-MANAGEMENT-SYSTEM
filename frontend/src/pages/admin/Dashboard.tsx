import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import {
  Users,
  Receipt,
  TrendingUp,
  Shield,
  Settings,
  ArrowUpRight,
  Activity,
  Loader2,
} from 'lucide-react';

interface AdminStats {
  overview: {
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    rejectedExpenses: number;
    inProgressExpenses: number;
    totalUsers: number;
    pendingApprovals: number;
    totalApprovedAmount: number;
    totalPendingAmount: number;
  };
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    submitter: { id: string; name: string };
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    totalAmount: number;
  }>;
}

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AdminStats | null>(null);
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

  const stats = [
    {
      label: 'Total Expenses',
      value: String(o?.totalExpenses ?? 0),
      change: `${o?.pendingExpenses ?? 0} pending`,
      icon: <Receipt className="w-5 h-5" />,
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Total Users',
      value: String(o?.totalUsers ?? 0),
      change: `${o?.pendingApprovals ?? 0} pending approvals`,
      icon: <Users className="w-5 h-5" />,
      bgLight: 'bg-accent-50',
      textColor: 'text-accent-600',
    },
    {
      label: 'Total Reimbursed',
      value: `₹${((o?.totalApprovedAmount ?? 0) / 100000).toFixed(1)}L`,
      change: `₹${((o?.totalPendingAmount ?? 0) / 100000).toFixed(1)}L pending`,
      icon: <TrendingUp className="w-5 h-5" />,
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Categories',
      value: String(data?.categoryBreakdown?.length ?? 0),
      change: `${o?.approvedExpenses ?? 0} approved`,
      icon: <Settings className="w-5 h-5" />,
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
  ];

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success-500';
      case 'rejected': return 'bg-danger-500';
      case 'in_progress': return 'bg-warning-500';
      default: return 'bg-primary-500';
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      {/* Stats */}
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
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-surface-900">Recent Expenses</h2>
              <p className="text-sm text-surface-400">Latest submissions across the company</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-surface-50">
          {(data?.recentExpenses ?? []).map((item, i) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-start gap-4 hover:bg-surface-50/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="mt-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(item.status)}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-surface-800">
                  <span className="font-semibold">{item.description}</span> by {item.submitter.name}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {item.currency} {item.amount.toLocaleString()} · {item.status}
                </p>
              </div>
              <span className="text-xs text-surface-400 whitespace-nowrap">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(data?.recentExpenses ?? []).length === 0 && (
            <div className="px-6 py-8 text-center text-surface-400 text-sm">
              No expenses yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
