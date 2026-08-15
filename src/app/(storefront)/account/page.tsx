import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/require-admin";
import { getMyOrders } from "@/server/services/order.service";
import { formatAED } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const session = await requireCustomerSession();
  const userId = (session.user as { id: string }).id;
  const orders = await getMyOrders(userId);

  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Account</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-sm text-slate-500">Total Orders</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-slate-900">
            {orders.filter((o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)).length}
          </p>
          <p className="text-sm text-slate-500">Active Orders</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-slate-900">
            {formatAED(orders.reduce((sum, o) => sum + Number(o.grandTotal), 0))}
          </p>
          <p className="text-sm text-slate-500">Total Spent</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Recent Orders</h2>
        <Link href="/account/orders" className="text-sm text-orange-600 hover:underline">
          View all
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="text-sm text-slate-500">
          No orders yet — <Link href="/shop" className="text-orange-600 hover:underline">start shopping</Link>.
        </p>
      ) : (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-800 text-sm">{order.orderNumber}</p>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("en-AE")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{formatAED(order.grandTotal.toString())}</p>
                <p className="text-xs text-slate-500">{order.status.replace(/_/g, " ")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
