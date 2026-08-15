import type { DefaultSession } from "next-auth";

// Extends Auth.js's built-in types so `session.user.id` / `.role` and
// `token.id` / `.role` are recognized by TypeScript everywhere in the app,
// instead of needing `as` casts at every usage site.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
  }
}
