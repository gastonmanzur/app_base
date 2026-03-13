export type UserRole = 'admin' | 'user';
export type AuthProvider = 'local' | 'google';

export interface HealthDto {
  status: 'ok';
  timestamp: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  emailVerified: boolean;
}
