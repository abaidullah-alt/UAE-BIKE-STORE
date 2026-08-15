import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth.config";
import { LogoutButton } from "./logout-button";

const navItems = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/addresses", label: "My Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
        <aside className="space-y-1">
          <p className="text-sm text-slate-500 mb-3">
            Signed in as <span className="font-medium text-slate-800">{session.user.name}</span>
          </p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-orange-600"
            >
              {item.label}
            </Link>
          ))}
          <LogoutButton />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
