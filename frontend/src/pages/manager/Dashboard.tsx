import useAuthStore from '../../store/authStore';
import {
  Users,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';

export default function ManagerDashboard() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    {
      label: 'Pending Approvals',
      value: '5',
      change: '2 urgent',
      icon: <Clock className="w-5 h-5" />,
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
    {
      label: 'Approved This Month',
      value: '18',
      change: '+6 from last month',
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Rejected',
      value: '3',
      change: '14% rejection rate',
      icon: <XCircle className="w-5 h-5" />,
      bgLight: 'bg-danger-50',
      textColor: 'text-danger-600',
    },
    {
      label: 'Team Members',
      value: '8',
      change: '2 departments',
      icon: <Users className="w-5 h-5" />,
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
  ];

  const pendingItems = [
    { id: 1, submitter: 'Charlie Davis', desc: 'Lunch with design team', amount: '₹3,799', time: '2 hours ago', category: 'Meals' },
    { id: 2, submitter: 'Diana Patel', desc: 'React workshop registration', amount: '₹26,720', time: '4 hours ago', category: 'Training' },
    { id: 3, submitter: 'Charlie Davis', desc: 'MacBook charger & hub', amount: '₹1,00,200', time: '1 day ago', category: 'Hardware' },
  ];

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">
          Manager Dashboard
        </h1>
        <p className="page-subtitle">
          Welcome back, {user?.name?.split(' ')[0]}. You have <span className="text-warning-600 font-semibold">5 pending approvals</span>.
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
          <button className="btn-ghost text-sm">View All</button>
        </div>
        <div className="divide-y divide-surface-50">
          {pendingItems.map((item, i) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-surface-50/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-500 text-sm font-bold">
                  {item.submitter.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{item.desc}</p>
                  <p className="text-xs text-surface-400">{item.submitter} · {item.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-surface-700 font-mono">{item.amount}</span>
                <div className="flex gap-2">
                  <button className="btn-success text-xs px-3 py-1.5">Approve</button>
                  <button className="btn-danger text-xs px-3 py-1.5">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
