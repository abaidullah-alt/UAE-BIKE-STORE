import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/require-admin";
import { getMyOrders } from "@/server/services/order.service";
import { formatAED } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PAYMENT_PENDING: "bg-orange-100 text-orange-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  PACKED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURNED: "bg-slate-100 text-slate-700",
  REFUND_REQUESTED: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-slate-100 text-slate-700",
};

export default async function MyOrdersPage() {
  const session = await requireCustomerSession();
  const userId = (session.user as { id: string }).id;
  const orders = await getMyOrders(userId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          No orders yet — <Link href="/shop" className="text-orange-600 hover:underline">start shopping</Link>.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block border border-slate-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-AE", { dateStyle: "medium" })} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatAED(order.grandTotal.toString())}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
