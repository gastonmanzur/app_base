export type UserRole = 'admin' | 'user';
export type AuthProvider = 'local' | 'google';

export interface AvatarDto {
  url: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
}

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
  avatar: AvatarDto | null;
}
