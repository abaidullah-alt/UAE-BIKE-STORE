"use client";

import { useState, useTransition } from "react";
import { setCustomerStatusAction } from "@/server/actions/admin-customer";
import { Button } from "@/components/ui/button";

export function CustomerStatusToggle({
  customerId,
  currentStatus,
}: {
  customerId: string;
  currentStatus: "ACTIVE" | "SUSPENDED" | "DELETED";
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (next === "SUSPENDED" && !confirm("Suspend this customer? They won't be able to log in.")) return;
    startTransition(async () => {
      const result = await setCustomerStatusAction(customerId, next);
      if (result.success) setStatus(next);
    });
  }

  return (
    <Button variant={status === "ACTIVE" ? "outline" : "secondary"} size="sm" onClick={handleToggle} disabled={isPending}>
      {status === "ACTIVE" ? "Suspend Customer" : "Reactivate Customer"}
    </Button>
  );
}
