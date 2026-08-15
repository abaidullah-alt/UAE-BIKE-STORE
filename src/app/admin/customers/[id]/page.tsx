import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerById } from "@/server/services/admin-customer.service";
import { formatAED } from "@/lib/utils";
import { emirateLabels } from "@/lib/validation/checkout";
import { CustomerStatusToggle } from "./customer-status-toggle";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.grandTotal), 0);

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-orange-600 hover:underline mb-4 inline-block">
        ← Back to Customers
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.fullName}</h1>
          <p className="text-sm text-slate-500">{customer.email} · {customer.phone ?? "No phone on file"}</p>
        </div>
        <CustomerStatusToggle customerId={customer.id} currentStatus={customer.status} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{customer.orders.length}</p>
          <p className="text-xs text-slate-500">Total Orders</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{formatAED(totalSpent)}</p>
          <p className="text-xs text-slate-500">Total Spent</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">
            {new Date(customer.createdAt).toLocaleDateString("en-AE")}
          </p>
          <p className="text-xs text-slate-500">Customer Since</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Order History</h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex justify-between items-center py-3 text-sm hover:text-orange-600"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("en-AE")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAED(order.grandTotal.toString())}</p>
                    <p className="text-xs text-slate-400">{order.status.replace(/_/g, " ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Saved Addresses</h2>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-slate-400">No saved addresses.</p>
          ) : (
            <div className="space-y-4">
              {customer.addresses.map((address) => (
                <div key={address.id} className="text-sm text-slate-600 pb-4 border-b border-slate-100 last:border-0">
                  <p className="font-medium text-slate-800">{address.fullName}</p>
                  <p>
                    {address.street}, {address.buildingVilla}<br />
                    {address.area}, {emirateLabels[address.emirate]}<br />
                    {address.phone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
