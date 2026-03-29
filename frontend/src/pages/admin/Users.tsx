import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Users as UsersIcon,
  Mail,
  Shield,
  UserCog,
} from 'lucide-react';
import { usersApi } from '../../api/users.api';
import type { User, UserRole } from '../../types';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
    managerId: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const managers = users.filter((u) => u.role === 'manager' || u.role === 'admin');

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'employee', managerId: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      managerId: user.managerId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          role: form.role,
          managerId: form.managerId || undefined,
        });
        toast.success('User updated');
      } else {
        if (!form.password) {
          toast.error('Password is required for new users');
          return;
        }
        await usersApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          managerId: form.managerId || undefined,
        });
        toast.success('User created');
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-danger-50 text-danger-600';
      case 'manager':
        return 'bg-primary-50 text-primary-600';
      default:
        return 'bg-accent-50 text-accent-600';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <UsersIcon className="w-7 h-7 text-primary-600" />
            Manage Users
          </h1>
          <p className="page-subtitle">Create, edit, and manage team members</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary" id="new-user-btn">
          <Plus className="w-5 h-5" /> New User
        </button>
      </div>

      {/* Users table — matching wireframe's User/Role/Manager/Email columns */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Manager</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Email</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {users.map((user, i) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-50/60 transition-colors animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-surface-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge text-xs ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-surface-600">
                        {user.managerId
                          ? users.find((u) => u.id === user.managerId)?.name || '—'
                          : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-surface-500">{user.email}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-500 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal — matching wireframe's New user form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-surface-900">
                {editingUser ? 'Edit User' : 'New User'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="input-label">Full Name</label>
                <input
                  className="input-field"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>

              {/* Email */}
              <div>
                <label className="input-label flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-surface-400" /> Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="user@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>

              {/* Password — only for new users */}
              {!editingUser && (
                <div>
                  <label className="input-label">Password</label>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              {/* Role dropdown — matching wireframe */}
              <div>
                <label className="input-label flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-surface-400" /> Role
                </label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Manager dropdown — matching wireframe */}
              <div>
                <label className="input-label flex items-center gap-2">
                  <UserCog className="w-3.5 h-3.5 text-surface-400" /> Manager
                </label>
                <select
                  className="input-field"
                  value={form.managerId}
                  onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                >
                  <option value="">No manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
