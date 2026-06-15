import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export const registerUser = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    email,
    passwordHash,
    name,
  });

  const token = await generateToken(newUser.id);

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = await generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

const generateToken = async (userId: string): Promise<string> => {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
};
