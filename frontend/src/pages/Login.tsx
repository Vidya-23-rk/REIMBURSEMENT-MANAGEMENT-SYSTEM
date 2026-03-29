import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowRight, Shield } from 'lucide-react';
import { authApi } from '../api/auth.api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { user, token } = await authApi.login(form);
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick-fill for demo purposes
  const quickFill = (role: 'admin' | 'manager' | 'employee') => {
    const creds: Record<string, { email: string; password: string }> = {
      admin:    { email: 'admin@techcorp.com',  password: 'admin123' },
      manager:  { email: 'priya@techcorp.com',  password: 'manager123' },
      employee: { email: 'amit@techcorp.com',   password: 'employee123' },
    };
    setForm(creds[role]);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-white/90 text-xl font-display font-bold">RMS</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-6">
            Streamline Your
            <br />
            <span className="text-accent-300">Expense Management</span>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-md mb-10">
            Submit, track, and approve reimbursements with a modern workflow
            designed for speed and transparency.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Multi-Currency', 'OCR Scanning', 'Smart Approvals', 'Real-time Status'].map(
              (f) => (
                <span
                  key={f}
                  className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm border border-white/10"
                >
                  {f}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-2 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-primary-700 text-lg font-display font-bold">RMS</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-surface-900 mb-2">
            Welcome back
          </h2>
          <p className="text-surface-500 mb-8">
            Enter your credentials to access your account
          </p>

          {/* Quick-fill demo buttons */}
          <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-xs font-semibold text-primary-700 mb-2 uppercase tracking-wider">
              Demo Quick Login
            </p>
            <div className="flex gap-2">
              {(['employee', 'manager', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickFill(role)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white text-primary-600 text-xs font-semibold border border-primary-200 hover:bg-primary-100 transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="input-label">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className={`input-field ${errors.email ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="input-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.password ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger-500">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base"
              id="login-submit-btn"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-surface-500 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
