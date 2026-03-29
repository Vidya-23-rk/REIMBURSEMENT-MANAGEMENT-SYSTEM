import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Shield, Building2 } from 'lucide-react';
import { authApi } from '../api/auth.api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { user, token } = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
      });
      setAuth(user, token);
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-32 right-20 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/2 w-40 h-40 bg-primary-400/10 rounded-full blur-2xl" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
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
            Join the Future of
            <br />
            <span className="text-accent-300">Reimbursements</span>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-md mb-10">
            Set up your organization in minutes. Smart approval workflows,
            multi-currency support, and OCR receipt scanning — all included.
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {[
              { step: '01', title: 'Create your account', desc: 'Quick 30-second setup' },
              { step: '02', title: 'Add your team', desc: 'Invite managers & employees' },
              { step: '03', title: 'Start tracking', desc: 'Submit & approve expenses instantly' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-accent-300 text-sm font-bold font-mono">
                  {item.step}
                </span>
                <div>
                  <p className="text-white font-semibold">{item.title}</p>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
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
            Create your account
          </h2>
          <p className="text-surface-500 mb-8">
            Get started with your expense management journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="input-label">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                className={`input-field ${errors.name ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="signup-company" className="input-label">
                Company Name
              </label>
              <div className="relative">
                <input
                  id="signup-company"
                  type="text"
                  className={`input-field pl-11 ${errors.companyName ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-xs text-danger-500">{errors.companyName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="input-label">
                Work Email
              </label>
              <input
                id="signup-email"
                type="email"
                className={`input-field ${errors.email ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="input-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.password ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="input-label">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                className={`input-field ${errors.confirmPassword ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base mt-2"
              id="signup-submit-btn"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-surface-500 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
