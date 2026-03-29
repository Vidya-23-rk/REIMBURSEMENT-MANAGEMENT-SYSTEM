import useAuthStore from '../../store/authStore';
import {
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);

  const stats = [
    {
      label: 'Total Submitted',
      value: '12',
      change: '+3 this month',
      icon: <Receipt className="w-5 h-5" />,
      color: 'from-primary-500 to-primary-600',
      bgLight: 'bg-primary-50',
      textColor: 'text-primary-600',
    },
    {
      label: 'Approved',
      value: '8',
      change: '66.7%',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'from-success-400 to-success-600',
      bgLight: 'bg-success-50',
      textColor: 'text-success-600',
    },
    {
      label: 'Pending',
      value: '3',
      change: 'Awaiting review',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-warning-400 to-warning-500',
      bgLight: 'bg-warning-50',
      textColor: 'text-warning-600',
    },
    {
      label: 'Total Amount',
      value: '₹1,52,400',
      change: '+₹28,500 this month',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-accent-500 to-accent-600',
      bgLight: 'bg-accent-50',
      textColor: 'text-accent-600',
    },
  ];

  const recentExpenses = [
    { id: 'e1', desc: 'Flight to client meeting', amount: '₹20,875', status: 'approved', date: 'Mar 15' },
    { id: 'e2', desc: 'Lunch with design team', amount: '₹3,799', status: 'pending', date: 'Mar 20' },
    { id: 'e3', desc: 'MacBook charger and USB-C hub', amount: '₹1,00,200', status: 'in_progress', date: 'Mar 22' },
    { id: 'e4', desc: 'Cab to airport', amount: '₹2,350', status: 'approved', date: 'Mar 25' },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-approved';
      case 'pending':
        return 'badge-pending';
      case 'rejected':
        return 'badge-rejected';
      case 'in_progress':
        return 'badge-in-progress';
      default:
        return 'badge';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
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
            <p className="text-2xl font-bold font-display text-surface-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-surface-400 font-medium">{stat.label}</p>
            <p className="text-xs text-surface-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Expenses */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-surface-900">
              Recent Expenses
            </h2>
            <p className="text-sm text-surface-400">Your latest submissions</p>
          </div>
          <button className="btn-ghost text-sm">View All</button>
        </div>
        <div className="divide-y divide-surface-50">
          {recentExpenses.map((expense, i) => (
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
                  <p className="text-sm font-semibold text-surface-800">
                    {expense.desc}
                  </p>
                  <p className="text-xs text-surface-400">{expense.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-surface-700 font-mono">
                  {expense.amount}
                </span>
                <span className={getStatusStyles(expense.status)}>
                  {expense.status === 'in_progress' ? 'In Progress' : expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
