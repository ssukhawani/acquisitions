import { z } from 'zod';

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(255, { message: 'Name must be at most 255 characters long' })
    .trim(),
  email: z
    .email({ message: 'Invalid email address' })
    .toLowerCase()
    .max(255, { message: 'Email must be at most 255 characters long' })
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(128, { message: 'Password must be at most 128 characters long' }),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.email({ message: 'Invalid email address' }).toLowerCase().trim(),
  password: z
    .string()
    .min(1, { message: 'Password must be at least 1 character long' }),
});
