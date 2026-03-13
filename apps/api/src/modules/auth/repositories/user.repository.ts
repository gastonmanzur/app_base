import type { UserRole } from '@starter/shared-types';
import { UserModel, type UserDocument } from '../models/user.model.js';

export class UserRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async create(input: {
    email: string;
    provider: 'local' | 'google';
    passwordHash?: string;
    emailVerified: boolean;
    googleId?: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    return UserModel.create(input);
  }

  async markEmailVerified(userId: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { emailVerified: true } }).exec();
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { passwordHash } }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { lastLoginAt: new Date() } }).exec();
  }
}
