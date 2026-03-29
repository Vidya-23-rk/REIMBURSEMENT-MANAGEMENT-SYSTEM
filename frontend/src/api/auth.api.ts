import api from './axios';
import { mockCurrentUser, mockToken, mockUsers } from './mock';
import type { AuthResponse, LoginPayload, SignupPayload } from '../types';
import { USE_MOCK } from '../config';


export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      // Find by email (mock login accepts any password)
      const user = mockUsers.find((u) => u.email === payload.email);
      if (!user) throw new Error('Invalid email or password');
      return { token: mockToken, user };
    }

    const { data } = await api.post<{ success: true; data: AuthResponse }>(
      '/auth/login',
      payload
    );
    return data.data;
  },

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1000));
      return {
        token: mockToken,
        user: {
          ...mockCurrentUser,
          name: payload.name,
          email: payload.email,
        },
      };
    }

    const { data } = await api.post<{ success: true; data: AuthResponse }>(
      '/auth/signup',
      payload
    );
    return data.data;
  },
};
