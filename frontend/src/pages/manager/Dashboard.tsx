import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ManagerData {
  role: string;
  overview: {
    pendingApprovals: number;
    completedApprovals: number;
    teamMembers: number;
  };
  pendingApprovalDetails: Array<{
    id: string;
    createdAt: string;
    expense: {
      id: string;
      description: string;
      amount: number;
      currency: string;
      category: string;
      submitter: { id: string; name: string };
    };
  }>;
}

export default function ManagerDashboard() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [data, setData] = useState<ManagerData | null>(null);
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
  const approvedCount = (o?.completedApprovals ?? 0);
  const pendingCount = o?.pendingApprovals ?? 0;

  const stats = [
    {
      label: 'Pending Approvals',
      value: String(pendingCount),
      change: 'Needs your action',
      icon: <Clock className="w-5 h-5" />,
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
    {
      label: 'Completed Reviews',
      value: String(approvedCount),
      change: 'Approved + Rejected',
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Total Reviews',
      value: String(pendingCount + approvedCount),
      change: `${pendingCount > 0 ? Math.round((pendingCount / (pendingCount + approvedCount)) * 100) : 0}% pending`,
      icon: <XCircle className="w-5 h-5" />,
      bgLight: 'bg-danger-50',
      textColor: 'text-danger-600',
    },
    {
      label: 'Team Members',
      value: String(o?.teamMembers ?? 0),
      change: 'Direct reports',
      icon: <Users className="w-5 h-5" />,
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.name?.split(' ')[0]}.
          {pendingCount > 0 && (
            <> You have <span className="text-warning-600 font-semibold">{pendingCount} pending approvals</span>.</>
          )}
          {pendingCount === 0 && " You're all caught up! 🎉"}
        </p>
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

      {/* Pending Approvals */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-warning-500" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-surface-900">Requires Your Action</h2>
              <p className="text-sm text-surface-400">Review and approve/reject pending expenses</p>
            </div>
          </div>
          <button onClick={() => navigate('/approvals')} className="btn-ghost text-sm">View All</button>
        </div>
        <div className="divide-y divide-surface-50">
          {(data?.pendingApprovalDetails ?? []).slice(0, 5).map((item, i) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-500 text-sm font-bold">
                  {item.expense.submitter.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{item.expense.description}</p>
                  <p className="text-xs text-surface-400">{item.expense.submitter.name} · {item.expense.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-surface-700 font-mono">
                  {item.expense.currency} {item.expense.amount.toLocaleString()}
                </span>
                <span className="badge-pending">Pending</span>
              </div>
            </div>
          ))}
          {(data?.pendingApprovalDetails ?? []).length === 0 && (
            <div className="px-6 py-8 text-center text-surface-400 text-sm">
              No pending approvals — you're all caught up! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
