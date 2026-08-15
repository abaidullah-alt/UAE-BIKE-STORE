"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactResult = { success: true } | { success: false; error: string };

export async function submitContactForm(formData: unknown): Promise<ContactResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many messages sent. Please try again in a few minutes." };
  }

  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Stored as a Notification for now so it's visible somewhere real (no
  // dedicated ContactMessage model yet, and no email provider connected —
  // see Phase 1 open questions). Good enough to prove the flow end-to-end;
  // swap for a real email send once an email provider is chosen.
  await prisma.notification.create({
    data: {
      userId: (await prisma.user.findFirst({ where: { roleId: { not: null } } }))?.id ?? "",
      type: "contact_form",
      message: `New contact form message from ${parsed.data.name} (${parsed.data.email}): ${parsed.data.message}`,
    },
  }).catch(() => {
    // If there's no admin user yet to attach the notification to, don't
    // let that break the contact form submission itself.
  });

  console.log("Contact form submission:", parsed.data);

  return { success: true };
}
