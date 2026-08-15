import { prisma } from "@/lib/db/prisma";
import { formatAED } from "@/lib/utils";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  AUTHORIZED: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-700",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-700",
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: { select: { orderNumber: true, id: true } },
      refunds: true,
    },
  });

  const totalPaid = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRefunded = payments.reduce(
    (sum, p) => sum + p.refunds.reduce((s, r) => s + Number(r.amount), 0),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Payments</h1>
      <p className="text-sm text-slate-500 mb-6">{payments.length} transaction{payments.length === 1 ? "" : "s"}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{formatAED(totalPaid)}</p>
          <p className="text-xs text-slate-500">Total Collected</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{formatAED(totalRefunded)}</p>
          <p className="text-xs text-slate-500">Total Refunded</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Refunded</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const refunded = payment.refunds.reduce((s, r) => s + Number(r.amount), 0);
              return (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${payment.order.id}`} className="font-medium text-slate-800 hover:text-orange-600">
                      {payment.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{payment.provider === "cod" ? "Cash on Delivery" : payment.provider}</td>
                  <td className="px-4 py-3 text-slate-800">{formatAED(payment.amount.toString())}</td>
                  <td className="px-4 py-3 text-slate-500">{refunded > 0 ? formatAED(refunded) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[payment.status]}`}>
                      {payment.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(payment.createdAt).toLocaleDateString("en-AE")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No transactions yet.</p>}
      </div>
    </div>
  );
}
