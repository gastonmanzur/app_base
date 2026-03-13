import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1),
  CORS_ORIGIN: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  EMAIL_TOKEN_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(60),
  RESET_TOKEN_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(30),
  APP_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  AVATAR_STORAGE_DIR: z.string().default('storage/avatars'),
  AVATAR_PUBLIC_BASE_PATH: z.string().default('/media/avatars'),
  AVATAR_MAX_SIZE_BYTES: z.coerce.number().int().positive().default(2_097_152),
  GOOGLE_CLIENT_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default('no-reply@example.com'),
  PUSH_PROVIDER: z.enum(['noop', 'fcm']).default('noop'),
  FCM_PROJECT_ID: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),
  MONETIZATION_MODE: z.enum(['one_time_only', 'subscriptions_only', 'both']).default('both'),
  SUBSCRIPTION_PERIOD_MODE: z.enum(['monthly', 'yearly', 'both']).default('both'),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  MERCADOPAGO_API_BASE_URL: z.string().url().default('https://api.mercadopago.com'),
  MERCADOPAGO_CHECKOUT_SUCCESS_URL: z.string().url().optional(),
  MERCADOPAGO_CHECKOUT_FAILURE_URL: z.string().url().optional(),
  MERCADOPAGO_CHECKOUT_PENDING_URL: z.string().url().optional(),
  MERCADOPAGO_STATEMENT_DESCRIPTOR: z.string().max(16).optional(),
});

export const env = envSchema.parse(process.env);
