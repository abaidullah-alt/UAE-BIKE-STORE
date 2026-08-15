"use client";

import { useState } from "react";
import { adjustStockAction } from "@/server/actions/admin-inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StockAdjuster({ variantId }: { variantId: string }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-orange-600 hover:underline">
        Adjust Stock
      </button>
    );
  }

  async function handleSubmit() {
    setIsPending(true);
    setError(null);
    const result = await adjustStockAction(variantId, Number(delta), reason);
    setIsPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setDelta("");
    setReason("");
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Input
        type="number"
        placeholder="+/- qty"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        className="h-8 w-24 text-sm"
      />
      <Input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 w-32 text-sm"
      />
      <Button size="sm" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "..." : "Apply"}
      </Button>
      <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
        Cancel
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
