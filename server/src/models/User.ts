import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
