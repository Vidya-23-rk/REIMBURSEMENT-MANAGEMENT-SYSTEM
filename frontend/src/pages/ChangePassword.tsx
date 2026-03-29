import { useState } from 'react';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container max-w-xl">
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-3">
          <KeyRound className="w-7 h-7 text-primary-600" />
          Change Password
        </h1>
        <p className="page-subtitle">Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Current Password */}
        <div>
          <label htmlFor="current-password" className="input-label">Current Password</label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrent ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="input-label">New Password</label>
          <div className="relative">
            <input
              id="new-password"
              type={showNew ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Min 6 characters"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirm-password" className="input-label">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            className="input-field"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="mt-1 text-xs text-danger-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
          id="change-password-btn"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Changing...
            </span>
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    </div>
  );
}
