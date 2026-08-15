"use client";

import { useState } from "react";
import { updateTrackingAction } from "@/server/actions/admin-order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TrackingForm({
  orderId,
  currentTrackingNumber,
  currentTrackingUrl,
}: {
  orderId: string;
  currentTrackingNumber: string;
  currentTrackingUrl: string;
}) {
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl);
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsPending(true);
    const result = await updateTrackingAction(orderId, { trackingNumber, trackingUrl });
    setIsPending(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Tracking number"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        className="h-9 text-sm"
      />
      <Input
        placeholder="Tracking URL (optional)"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        className="h-9 text-sm"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Tracking"}
        </Button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}
