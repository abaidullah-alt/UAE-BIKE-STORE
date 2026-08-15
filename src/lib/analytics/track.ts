"use client";

// Session ID persists in a cookie-free way via sessionStorage — good enough
// for funnel analysis within a visit without adding another cookie banner
// concern. Falls back gracefully if sessionStorage is unavailable.
function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem("analytics_session_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export type AnalyticsEventType =
  | "PAGE_VIEW"
  | "PRODUCT_VIEW"
  | "SEARCH"
  | "ADD_TO_CART"
  | "CHECKOUT_STARTED"
  | "PURCHASE";

/**
 * Fires an analytics event two ways:
 * 1. To our own /api/analytics endpoint (always — powers admin-side
 *    conversion/abandonment reporting even with no third-party tool set up)
 * 2. To window.dataLayer for GA4, if NEXT_PUBLIC_GA_ID is configured —
 *    this is the hook point for any GA4/GTM/Meta Pixel/etc. integration.
 */
export function trackEvent(type: AnalyticsEventType, metadata?: Record<string, unknown>) {
  const sessionId = getSessionId();
  const path = typeof window !== "undefined" ? window.location.pathname : undefined;

  // Fire-and-forget — analytics must never block or break the UI.
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sessionId, path, metadata }),
    keepalive: true,
  }).catch(() => {
    // Silently ignore — a failed analytics call is not a user-facing error.
  });

  if (typeof window !== "undefined" && "dataLayer" in window) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
      event: type.toLowerCase(),
      ...metadata,
    });
  }
}
