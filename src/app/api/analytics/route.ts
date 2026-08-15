import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth.config";

const eventSchema = z.object({
  type: z.enum(["PAGE_VIEW", "PRODUCT_VIEW", "SEARCH", "ADD_TO_CART", "CHECKOUT_STARTED", "PURCHASE"]),
  sessionId: z.string().min(1),
  path: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    await prisma.analyticsEvent.create({
      data: {
        type: parsed.data.type,
        sessionId: parsed.data.sessionId,
        path: parsed.data.path,
        // Zod's z.record(z.string(), z.unknown()) produces a generic
        // Record<string, unknown>, which is looser than Prisma's InputJsonValue
        // (which requires every value to be JSON-serializable). This data
        // came from request.json() — it's already guaranteed JSON-safe by
        // definition, so the cast is accurate, not just a type-checker workaround.
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
        userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics failures should never surface as errors to the client.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
