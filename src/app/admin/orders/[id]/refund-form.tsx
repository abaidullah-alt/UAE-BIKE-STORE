"use client";

import { useState } from "react";
import { markRefundAction } from "@/server/actions/admin-order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RefundForm({ paymentId, maxAmount }: { paymentId: string; maxAmount: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(maxAmount.toString());
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-orange-600 hover:underline mt-2">
        Issue Refund
      </button>
    );
  }

  async function handleSubmit() {
    setIsPending(true);
    setError(null);
    const result = await markRefundAction(paymentId, Number(amount), reason || undefined);
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOpen(false);
  }

  return (
    <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
      <Input type="number" step="0.01" max={maxAmount} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-8 text-sm" />
      <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="h-8 text-sm" />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Processing..." : "Confirm Refund"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
      <p className="text-[11px] text-slate-400">
        Marks the refund as completed for record-keeping. Actually returning funds to the customer is handled manually (COD) or through your payment gateway once connected.
      </p>
    </div>
  );
}
