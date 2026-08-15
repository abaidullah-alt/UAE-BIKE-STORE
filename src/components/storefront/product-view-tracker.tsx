"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

export function ProductViewTracker({ productId, productName, price }: { productId: string; productName: string; price: number }) {
  useEffect(() => {
    trackEvent("PRODUCT_VIEW", { productId, productName, price });
    // Only fire once per mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
