import { describe, expect, it } from 'vitest';
import { requireRoles } from './middleware/auth.middleware.js';
import type { AuthenticatedRequest } from './types/auth-request.js';

describe('requireRoles', () => {
  it('throws when user role is not allowed', () => {
    const middleware = requireRoles('admin');
    const req = { auth: { userId: '1', role: 'user', email: 'u@test.com' } } as AuthenticatedRequest;

    expect(() => middleware(req, {} as never, () => undefined)).toThrowError('Insufficient permissions');
  });
});
