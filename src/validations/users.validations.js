import { z } from 'zod';

export const userIdSchema = z.object({
  id: z
    .string()
    .min(1, { message: 'User ID is required' })
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'User ID must be a positive integer',
    }),
});

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(255, { message: 'Name must be at most 255 characters long' })
      .trim()
      .optional(),
    email: z
      .email({ message: 'Invalid email address' })
      .toLowerCase()
      .max(255, { message: 'Email must be at most 255 characters long' })
      .trim()
      .optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(128, { message: 'Password must be at most 128 characters long' })
      .optional(),
    role: z
      .enum(['user', 'admin'], {
        errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
      })
      .optional(),
  })
  .refine(
    data => {
      // Ensure at least one field is provided for update
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    }
  );

export const queryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0), {
      message: 'Page must be a positive integer',
    })
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .refine(
      val =>
        !val ||
        (!isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100),
      {
        message: 'Limit must be a positive integer between 1 and 100',
      }
    )
    .transform(val => (val ? parseInt(val) : 10)),
  role: z.enum(['user', 'admin']).optional(),
  search: z
    .string()
    .max(255, { message: 'Search term must be at most 255 characters long' })
    .trim()
    .optional(),
});
