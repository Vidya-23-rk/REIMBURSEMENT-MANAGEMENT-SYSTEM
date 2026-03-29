import api from './axios';
import { mockUsers } from './mock';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types';
import { USE_MOCK } from '../config';


export const usersApi = {
  getAll: async (): Promise<User[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [...mockUsers];
    }
    const { data } = await api.get<{ success: true; data: User[] }>('/users');
    return data.data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const newUser: User = {
        id: `u${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        companyId: 'c1',
        managerId: payload.managerId || null,
        isManagerApprover: false,
      };
      mockUsers.push(newUser);
      return newUser;
    }
    const { data } = await api.post<{ success: true; data: User }>('/users', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      Object.assign(user, payload);
      return { ...user };
    }
    const { data } = await api.patch<{ success: true; data: User }>(`/users/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const idx = mockUsers.findIndex((u) => u.id === id);
      if (idx !== -1) mockUsers.splice(idx, 1);
      return;
    }
    await api.delete(`/users/${id}`);
  },
};
