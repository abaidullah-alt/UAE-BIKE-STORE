import { listCoupons } from "@/server/services/admin-coupon.service";
import { CouponForm } from "./coupon-form";
import { CouponRow } from "./coupon-row";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Coupons</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 max-w-2xl">
        <h2 className="font-semibold text-slate-900 mb-4">Create Coupon</h2>
        <CouponForm />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-4xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => (
              <CouponRow key={coupon.id} coupon={coupon} />
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No coupons yet.</p>}
      </div>
    </div>
  );
}
