import { describe, expect, it } from 'vitest';
import { AuthService } from './services/auth.service.js';
import { AppError } from '../../core/errors.js';

const baseUser = {
  _id: { toString: () => 'u1' },
  email: 'john@example.com',
  provider: 'local' as const,
  passwordHash: '$2a$12$4olHQ0YuV78f7u5d5cLjN.urRZA9E6xM8AYrWf8YhNfA0xB7GhGCu',
  role: 'user' as const,
  emailVerified: true
};

describe('AuthService', () => {
  it('rejects provider conflict on local register', async () => {
    const service = new AuthService(
      { findByEmail: async () => ({ ...baseUser, provider: 'google' }), create: async () => baseUser } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.registerLocal('john@example.com', 'Password123')).rejects.toMatchObject({
      code: 'PROVIDER_CONFLICT'
    });
  });

  it('rejects invalid credentials on local login', async () => {
    const service = new AuthService(
      { findByEmail: async () => ({ ...baseUser, passwordHash: '$2a$12$invalid.invalid.invalid.invalid.invalid' }) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.loginLocal('john@example.com', 'Password123')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS'
    });
  });

  it('returns generic response on forgot password for unknown user', async () => {
    const service = new AuthService(
      { findByEmail: async () => null } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await expect(service.forgotPassword('unknown@example.com')).resolves.toBeUndefined();
  });
});
