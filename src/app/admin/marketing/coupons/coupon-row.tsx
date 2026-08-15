"use client";

import { useState, useTransition } from "react";
import { toggleCouponAction, deleteCouponAction } from "@/server/actions/admin-coupon";
import { Trash2 } from "lucide-react";
import type { Coupon } from "@prisma/client";

export function CouponRow({ coupon }: { coupon: Coupon }) {
  const [isActive, setIsActive] = useState(coupon.isActive);
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{coupon.code}</td>
      <td className="px-4 py-3 text-slate-500">{coupon.type.replace(/_/g, " ")}</td>
      <td className="px-4 py-3 text-slate-800">
        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.type === "FIXED_AMOUNT" ? `AED ${coupon.value}` : "—"}
      </td>
      <td className="px-4 py-3 text-slate-500">
        {coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
      </td>
      <td className="px-4 py-3 text-slate-500">
        {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-AE") : "Never"}
      </td>
      <td className="px-4 py-3">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const next = !isActive;
              const result = await toggleCouponAction(coupon.id, next);
              if (result.success) setIsActive(next);
            })
          }
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this coupon?")) startTransition(() => { deleteCouponAction(coupon.id); });
          }}
          className="text-slate-400 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
