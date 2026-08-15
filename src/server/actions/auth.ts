"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { registerSchema, forgotPasswordSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import crypto from "crypto";

export type ActionResult = { success: true } | { success: false; error: string };

async function getClientIp() {
  const headersList = await headers();
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function registerCustomer(formData: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000); // 5 attempts / 15 min
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { fullName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Generic message — don't confirm account existence to an attacker,
    // but this is registration (not login) so a soft nudge here is acceptable UX.
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { fullName, email, phone, passwordHash, status: "ACTIVE" },
  });

  return { success: true };
}

export async function requestPasswordReset(formData: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Invalid email address" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always return success regardless of whether the account exists —
  // prevents attackers from using this endpoint to enumerate registered emails.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    // TODO (Phase: Email settings): persist token with expiry (e.g. a
    // PasswordResetToken model) and send via the transactional email provider.
    // Left as a stub here since the email provider hasn't been chosen yet.
    console.log(`Password reset token for ${user.email}: ${token}`);
  }

  return { success: true };
}
