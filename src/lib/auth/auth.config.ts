import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT sessions — required when using the Credentials provider. Auth.js
  // does not support database sessions with Credentials (only with OAuth
  // providers), since there's no OAuth account row to link a DB session
  // to. Role/id are embedded in the signed JWT instead (see callbacks
  // below) and re-synced from the database on every request via the
  // jwt callback, so a role change takes effect on the user's next
  // request rather than requiring instant server-side revocation.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Rate limit by IP (covers credential stuffing) and by email
        // (covers targeted brute-force against one account) separately.
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const ipLimit = checkRateLimit(`login-ip:${ip}`, 10, 15 * 60 * 1000);
        const emailLimit = checkRateLimit(`login-email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
        if (!ipLimit.allowed || !emailLimit.allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        // Deliberately vague failure — never reveal whether the email exists
        if (!user || !user.passwordHash) return null;
        if (user.status !== "ACTIVE") return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    // Runs whenever a JWT is created or read. We only need to set id/role
    // once, at actual sign-in (when `user` is present, returned from
    // authorize() above) — the values are then trusted for the lifetime
    // of the session token.
    //
    // Earlier version of this callback re-queried the database on every
    // single request to re-sync role/status instantly. That sounds nice
    // in theory, but in practice it meant nearly every page view issued
    // an extra database round-trip, which caused connection drops against
    // Neon's serverless Postgres under normal browsing ("Server has closed
    // the connection" / JWTSessionError). The tradeoff isn't worth it for
    // a store this size — a suspended account or role change now takes
    // effect on the user's *next login* rather than instantly. If you
    // need instant revocation later (e.g. once you have real staff
    // accounts), the fix is a lightweight check (e.g. Redis-cached status
    // flag) rather than a full Prisma query on every request.
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string | null }).role ?? null;
      }
      return token;
    },
    // Copies id/role from the JWT onto the session object the app reads.
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as typeof session.user & { id: string; role: string | null }).id =
          token.id as string;
        (session.user as typeof session.user & { role: string | null }).role =
          (token.role as string | null) ?? null;
      }
      return session;
    },
  },
});
