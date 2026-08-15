import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "./auth.config";
import { prisma } from "@/lib/db/prisma";
import type { PermissionKey } from "@/lib/security/permissions";

/**
 * Coarse-grained guard: any user with a Role at all can access /admin.
 * Use requirePermission() alongside this for actions that should be
 * restricted to specific roles (e.g. only Order Manager+ can refund).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  const role = (session.user as { role?: string | null }).role;
  if (!role) {
    redirect("/");
  }
  return session;
}

/**
 * Fine-grained guard: throws if the current staff user's role doesn't have
 * the given permission. Call this at the top of any server action that
 * performs a sensitive mutation (delete, refund, settings change, etc.).
 */
export async function requirePermission(permission: PermissionKey) {
  const session = await requireAdmin();
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  const hasPermission = user?.role?.permissions.some((rp) => rp.permission.key === permission);
  if (!hasPermission) {
    throw new Error(`You don't have permission to perform this action (${permission}).`);
  }

  return session;
}

/**
 * Route-handler-safe version of requirePermission(). API routes (files
 * under app/api/.../route.ts) are NOT the same execution context as pages
 * or Server Actions — calling next/navigation's redirect() there (which
 * requireAdmin()/requirePermission() do on failure) is unsupported and can
 * produce a confusing, hard-to-debug failure instead of a clean error
 * response. Use this in any app/api route that needs a permission check.
 */
export async function checkPermissionForApiRoute(
  permission: PermissionKey
): Promise<{ authorized: true; session: Session } | { authorized: false; status: number; error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, status: 401, error: "Not signed in" };
  }

  const role = (session.user as { role?: string | null }).role;
  if (!role) {
    return { authorized: false, status: 403, error: "Not authorized" };
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  const hasPermission = user?.role?.permissions.some((rp) => rp.permission.key === permission);
  if (!hasPermission) {
    return { authorized: false, status: 403, error: "Not authorized for this action" };
  }

  return { authorized: true, session };
}

/**
 * Safely requires a logged-in customer session, redirecting to /login if
 * missing. Use this instead of `(await auth())!.user` on any /account page
 * — relying solely on the parent layout's guard is fragile (e.g. a stale
 * cookie from a prior session-strategy change can produce a null session
 * on the page even after the layout appeared to pass).
 */
export async function requireCustomerSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }
  return session;
}
