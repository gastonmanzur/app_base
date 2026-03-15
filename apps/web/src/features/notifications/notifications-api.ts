import type { PushDeviceDto, PushPlatform } from '@starter/shared-types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
  const payload = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Unexpected request error');
  }
  return payload;
};

export const notificationsApi = {
  registerDevice: async (accessToken: string, input: { token: string; platform: PushPlatform; channel: 'web_push' | 'mobile_push' }): Promise<PushDeviceDto> => {
    const result = await request<{ success: true; data: { device: PushDeviceDto } }>('/push/devices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input)
    });
    return result.data.device;
  },
  unregisterDevice: async (accessToken: string, token: string): Promise<void> => {
    await request('/push/devices', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ token })
    });
  }
};
