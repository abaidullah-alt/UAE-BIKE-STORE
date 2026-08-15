"use client";

import { useState, useTransition } from "react";
import { markPaymentPaidAction } from "@/server/actions/admin-order";
import { Button } from "@/components/ui/button";

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleClick() {
    if (!confirm("Confirm you have received the cash payment for this order?")) return;
    setError(null);
    startTransition(async () => {
      const result = await markPaymentPaidAction(paymentId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) return <p className="text-sm text-green-600 mt-2 font-medium">✓ Payment Confirmed</p>;

  return (
    <div className="mt-2">
      <Button size="default" onClick={handleClick} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving..." : "Confirm Payment Received"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
