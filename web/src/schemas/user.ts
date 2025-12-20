import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  supabaseUserId: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type User = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
