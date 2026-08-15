import Link from "next/link";
import { listCustomers } from "@/server/services/admin-customer.service";
import { formatAED } from "@/lib/utils";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { items, total } = await listCustomers({ search: q, page: page ? Number(page) : 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Customers</h1>
      <p className="text-sm text-slate-500 mb-6">{total} customer{total === 1 ? "" : "s"}</p>

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or phone..."
          className="h-10 w-full max-w-sm rounded-md border border-slate-300 px-3 text-sm"
        />
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${customer.id}`} className="font-medium text-slate-800 hover:text-orange-600">
                    {customer.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{customer.email}</td>
                <td className="px-4 py-3 text-slate-500">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{customer.orderCount}</td>
                <td className="px-4 py-3 text-slate-800">{formatAED(customer.totalSpent)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    customer.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(customer.createdAt).toLocaleDateString("en-AE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No customers found.</p>}
      </div>
    </div>
  );
}
