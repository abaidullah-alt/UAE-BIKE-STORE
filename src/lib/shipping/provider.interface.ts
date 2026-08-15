import type { Emirate } from "@prisma/client";

export interface ShippingRateQuote {
  method: string;
  price: number;
  estimatedDays: string;
}

export interface ShipmentInput {
  orderId: string;
  emirate: Emirate;
}

export interface CreatedShipment {
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: "PREPARING" | "SHIPPED";
}

export interface TrackingStatus {
  status: string;
  lastUpdate?: string;
  history?: { status: string; timestamp: string }[];
}

/**
 * Every courier (manual, Aramex, etc.) implements this interface. Checkout
 * and admin shipment code only ever talk to ShippingService — this is the
 * swap-in point for a real UAE courier API later, without touching the
 * rest of the order flow.
 */
export interface ShippingProvider {
  readonly name: string;
  getRates(emirate: Emirate, subtotal: number): Promise<ShippingRateQuote[]>;
  createShipment(input: ShipmentInput): Promise<CreatedShipment>;
  trackShipment(trackingNumber: string): Promise<TrackingStatus>;
}
