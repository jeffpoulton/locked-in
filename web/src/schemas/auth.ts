import { z } from "zod";

/**
 * Schema for email-based authentication.
 */
export const emailAuthSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type EmailAuthInput = z.infer<typeof emailAuthSchema>;

/**
 * Schema for phone-based authentication.
 * Expects a phone number in E.164 format (e.g., +14155551234).
 */
export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Please enter a valid phone number with country code"
    ),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;

/**
 * Schema for OTP verification.
 * Expects a 6-digit numeric code.
 */
export const otpSchema = z.object({
  token: z
    .string()
    .length(6, "Please enter a 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type OTPInput = z.infer<typeof otpSchema>;

/**
 * Auth method types for the auth flow.
 */
export type AuthMethod = "email" | "phone";
