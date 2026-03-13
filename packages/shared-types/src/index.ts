export type UserRole = 'admin' | 'user';

export interface HealthDto {
  status: 'ok';
  timestamp: string;
}
