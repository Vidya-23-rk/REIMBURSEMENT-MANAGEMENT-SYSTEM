import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  CheckCircle2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Bell,
  Search,
  KeyRound,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'Dashboard',
    to: '/dashboard',
    roles: ['admin', 'manager', 'employee'],
  },
  {
    icon: <PlusCircle className="w-5 h-5" />,
    label: 'Submit Expense',
    to: '/expenses/new',
    roles: ['employee'],
  },
  {
    icon: <Receipt className="w-5 h-5" />,
    label: 'My Expenses',
    to: '/expenses',
    roles: ['employee'],
  },
  {
    icon: <Receipt className="w-5 h-5" />,
    label: 'All Expenses',
    to: '/expenses',
    roles: ['admin', 'manager'],
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Pending Approvals',
    to: '/approvals',
    roles: ['admin', 'manager'],
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: 'Manage Users',
    to: '/users',
    roles: ['admin'],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: 'Approval Rules',
    to: '/rules',
    roles: ['admin'],
  },
  {
    icon: <KeyRound className="w-5 h-5" />,
    label: 'Change Password',
    to: '/settings/password',
    roles: ['admin', 'manager', 'employee'],
  },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setSearchQuery] = useState('');

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-danger-50 text-danger-600';
      case 'manager':
        return 'bg-primary-50 text-primary-600';
      default:
        return 'bg-accent-50 text-accent-600';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-surface-900">RMS</h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest font-semibold">
              Reimbursement
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-2">
          Menu
        </p>
        {filteredNav.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-primary-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="p-3 mt-auto">
        <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-surface-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`badge text-[10px] ${getRoleColor(user?.role || '')}`}>
              {user?.role?.toUpperCase()}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-danger-500 transition-colors font-medium"
              id="logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-surface-100 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar — Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85%] h-full bg-white shadow-2xl animate-slide-in-right">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-surface-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger — mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-100 text-surface-600"
                id="mobile-menu-btn"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 border border-surface-100 w-80">
                <Search className="w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search expenses, reports..."
                  className="flex-1 bg-transparent text-sm text-surface-700 placeholder-surface-400 outline-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="global-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors"
                id="notifications-btn"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
              </button>

              {/* User avatar — desktop */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-surface-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-surface-700">{user?.name}</p>
                  <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
