import mongoose, { type InferSchemaType, type Model } from 'mongoose';

export const authProviders = ['local', 'google'] as const;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    provider: {
      type: String,
      enum: authProviders,
      required: true
    },
    passwordHash: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    googleId: {
      type: String,
      required: false
    },
    lastLoginAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);


export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
