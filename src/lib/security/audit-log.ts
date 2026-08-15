import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Records an admin action to the append-only AuditLog table. Call this
 * from server actions after a sensitive mutation succeeds (delete,
 * status change, refund, settings change, etc.) — never before, so a
 * failed action doesn't get logged as if it happened.
 */
export async function logAdminAction(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        // Same cast rationale as src/app/api/analytics/route.ts — callers
        // only ever pass plain JSON-serializable objects here, but the
        // generic Record<string, unknown> type is looser than Prisma's
        // InputJsonValue, so TypeScript needs the explicit cast.
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Audit logging must never break the underlying action — log and move on.
    console.error(`Failed to write audit log for ${params.action} on ${params.entityType}:${params.entityId}`);
  }
}
