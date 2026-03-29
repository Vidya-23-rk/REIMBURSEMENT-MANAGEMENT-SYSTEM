import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('rms_token', token);
    localStorage.setItem('rms_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (partial) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...partial };
      localStorage.setItem('rms_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },

  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  },

  // Rehydrate auth from localStorage on app start
  hydrate: () => {
    try {
      const token = localStorage.getItem('rms_token');
      const userJson = localStorage.getItem('rms_user');
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      localStorage.removeItem('rms_token');
      localStorage.removeItem('rms_user');
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
