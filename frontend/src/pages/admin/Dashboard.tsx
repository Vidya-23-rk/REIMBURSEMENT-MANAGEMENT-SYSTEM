import useAuthStore from '../../store/authStore';
import {
  Users,
  Receipt,
  TrendingUp,
  Shield,
  Settings,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    {
      label: 'Total Expenses',
      value: '156',
      change: '+24 this month',
      icon: <Receipt className="w-5 h-5" />,
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Total Users',
      value: '32',
      change: '4 departments',
      icon: <Users className="w-5 h-5" />,
      bgLight: 'bg-accent-50',
      textColor: 'text-accent-600',
    },
    {
      label: 'Total Reimbursed',
      value: '₹18.5L',
      change: '+₹3.2L this month',
      icon: <TrendingUp className="w-5 h-5" />,
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Active Rules',
      value: '6',
      change: '2 categories',
      icon: <Settings className="w-5 h-5" />,
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
  ];

  const recentActivity = [
    { id: 1, action: 'Expense approved', user: 'Bob Smith', target: 'Flight to Mumbai (₹20,875)', time: '10 min ago', type: 'success' },
    { id: 2, action: 'New expense submitted', user: 'Diana Patel', target: 'React workshop (₹26,720)', time: '2 hours ago', type: 'info' },
    { id: 3, action: 'Expense rejected', user: 'Bob Smith', target: 'Figma subscription (₹7,650)', time: '4 hours ago', type: 'danger' },
    { id: 4, action: 'New user added', user: 'Admin', target: 'Emily Chen (employee)', time: '1 day ago', type: 'info' },
    { id: 5, action: 'Rule updated', user: 'Admin', target: 'High Value Expense threshold', time: '2 days ago', type: 'warning' },
  ];

  const getActivityDot = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-500';
      case 'danger': return 'bg-danger-500';
      case 'warning': return 'bg-warning-500';
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
            Organization overview and system administration
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

      {/* Activity Feed */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-surface-900">Recent Activity</h2>
              <p className="text-sm text-surface-400">Organization-wide activity log</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-surface-50">
          {recentActivity.map((item, i) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-start gap-4 hover:bg-surface-50/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${(i + 4) * 60}ms` }}
            >
              <div className="mt-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${getActivityDot(item.type)}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-surface-800">
                  <span className="font-semibold">{item.action}</span> by {item.user}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">{item.target}</p>
              </div>
              <span className="text-xs text-surface-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
