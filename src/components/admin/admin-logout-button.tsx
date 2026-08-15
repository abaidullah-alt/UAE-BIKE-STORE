"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-400"
    >
      <LogOut className="h-3.5 w-3.5" />
      Log Out
    </button>
  );
}
