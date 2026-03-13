import type { AuthUserDto, AvatarDto } from '@starter/shared-types';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthResponse {
  success: true;
  data: {
    accessToken: string;
    user: AuthUserDto;
  };
}

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers
  });
  const payload = (await response.json()) as T & { success?: boolean; error?: { message: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Unexpected request error');
  }
  return payload;
};

export const authApi = {
  register: async (email: string, password: string): Promise<void> => {
    await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const result = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    return result.data;
  },
  loginGoogle: async (idToken: string): Promise<AuthResponse['data']> => {
    const result = await request<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) });
    return result.data;
  },
  refresh: async (): Promise<AuthResponse['data']> => {
    const result = await request<AuthResponse>('/auth/refresh', { method: 'POST' });
    return result.data;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
  },
  changePassword: async (accessToken: string, currentPassword: string, newPassword: string): Promise<void> => {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },
  logout: async (): Promise<void> => {
    await request('/auth/logout', { method: 'POST' });
  },
  logoutAll: async (accessToken: string): Promise<void> => {
    await request('/auth/logout-all', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } });
  },
  me: async (accessToken: string): Promise<AuthUserDto> => {
    const result = await request<{ success: true; data: AuthUserDto }>('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return result.data;
  },
  verifyEmail: async (token: string): Promise<void> => {
    await request(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: 'GET' });
  },
  uploadMyAvatar: async (accessToken: string, avatarFile: File): Promise<AvatarDto | null> => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const result = await request<{ success: true; data: { avatar: AvatarDto | null } }>('/avatars/me', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return result.data.avatar;
  },
  deleteMyAvatar: async (accessToken: string): Promise<void> => {
    await request('/avatars/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
};
