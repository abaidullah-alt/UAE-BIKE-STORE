"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/server/actions/admin-order";
import type { OrderStatus } from "@prisma/client";

const statuses: OrderStatus[] = [
  "PENDING", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED",
  "REFUND_REQUESTED", "REFUNDED",
];

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleChange(newStatus: OrderStatus) {
    setStatus(newStatus);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="h-10 rounded-md border border-slate-300 px-3 text-sm font-medium"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}
