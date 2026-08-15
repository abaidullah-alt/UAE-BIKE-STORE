import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, Users,
  Boxes, Megaphone, Truck, CreditCard, BarChart3, FileText, Settings,
} from "lucide-react";

const navGroups = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/brands", label: "Brands", icon: Tag },
    ],
  },
  {
    title: "Orders",
    items: [{ href: "/admin/orders", label: "All Orders", icon: ShoppingCart }],
  },
  {
    title: "Customers",
    items: [{ href: "/admin/customers", label: "All Customers", icon: Users }],
  },
  {
    title: "Inventory",
    items: [{ href: "/admin/inventory", label: "Stock", icon: Boxes }],
  },
  {
    title: "Marketing",
    items: [{ href: "/admin/marketing/coupons", label: "Coupons", icon: Megaphone }],
  },
  {
    title: "Shipping",
    items: [{ href: "/admin/shipping", label: "Zones & Rates", icon: Truck }],
  },
  {
    title: "Payments",
    items: [{ href: "/admin/payments", label: "Transactions", icon: CreditCard }],
  },
  {
    title: "Reports",
    items: [{ href: "/admin/reports", label: "Sales & Products", icon: BarChart3 }],
  },
  {
    title: "Content",
    items: [{ href: "/admin/content", label: "Pages & FAQs", icon: FileText }],
  },
  {
    title: "Settings",
    items: [{ href: "/admin/settings", label: "Store Settings", icon: Settings }],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <Link href="/admin" className="text-lg font-black text-white">
            UAE<span className="text-orange-500"> BICYCLE</span>
            <span className="block text-xs font-normal text-slate-400 mt-0.5">Admin Dashboard</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-4">
              {group.title && (
                <p className="px-5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-2 text-sm hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">{session.user?.name}</p>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
