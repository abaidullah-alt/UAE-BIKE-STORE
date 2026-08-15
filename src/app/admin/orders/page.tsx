import Link from "next/link";
import { listAdminOrders } from "@/server/services/admin-order.service";
import { formatAED } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const statusTabs: { label: string; value: OrderStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returns", value: "RETURN_REQUESTED" },
];

const statusStyles: Record<string, string> = {
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const { items, total } = await listAdminOrders({
    status: status as OrderStatus | undefined,
    search: q,
    page: page ? Number(page) : 1,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Orders</h1>
      <p className="text-sm text-slate-500 mb-6">{total} order{total === 1 ? "" : "s"}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              status === tab.value || (!status && !tab.value)
                ? "bg-orange-600 text-white border-orange-600"
                : "border-slate-300 text-slate-600 hover:border-orange-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form className="mb-4">
        <input type="hidden" name="status" value={status ?? ""} />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by order #, name, or email..."
          className="h-10 w-full max-w-sm rounded-md border border-slate-300 px-3 text-sm"
        />
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-slate-800 hover:text-orange-600">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{order.shippingFullName || order.user?.email}</td>
                <td className="px-4 py-3 text-slate-500">{order.items.length}</td>
                <td className="px-4 py-3 text-slate-800">{formatAED(order.grandTotal.toString())}</td>
                <td className="px-4 py-3 text-slate-500">
                  {(() => {
                    const payment = order.payments[0];
                    const shippedOrLater = ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
                    const needsConfirmation =
                      shippedOrLater && payment && !["PAID", "REFUNDED", "PARTIALLY_REFUNDED"].includes(payment.status);
                    return (
                      <span className={needsConfirmation ? "text-orange-600 font-medium" : ""}>
                        {payment?.provider === "cod" ? "COD" : "Online"} · {payment?.status}
                        {needsConfirmation && " ⚠️"}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("en-AE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No orders found.</p>}
      </div>
    </div>
  );
}
