const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

const request = async <T>(path: string, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers });
  const payload = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Unexpected request error');
  }

  return payload;
};

export const paymentsApi = {
  createOneTime: async (accessToken: string, input: { title: string; amount: number; currency: string }) => {
    const result = await request<{ success: true; data: { checkoutUrl: string } }>('/payments/one-time', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input)
    });

    return result.data;
  },
  createSubscription: async (
    accessToken: string,
    input: { planCode: string; title: string; amount: number; currency: string; period: 'monthly' | 'yearly' }
  ) => {
    const result = await request<{ success: true; data: { checkoutUrl: string } }>('/payments/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(input)
    });

    return result.data;
  },
  listAdminTransactions: async (accessToken: string) => {
    const result = await request<{ success: true; data: Array<{ _id: string; status: string; amount: number; createdAt: string }> }>(
      '/payments/admin/transactions',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return result.data;
  },
  listAdminSubscriptions: async (accessToken: string) => {
    const result = await request<{ success: true; data: Array<{ _id: string; status: string; period: string; createdAt: string }> }>(
      '/payments/admin/subscriptions',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return result.data;
  }
};
