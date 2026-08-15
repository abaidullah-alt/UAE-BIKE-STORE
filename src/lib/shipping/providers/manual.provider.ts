import type {
  ShippingProvider,
  ShippingRateQuote,
  ShipmentInput,
  CreatedShipment,
  TrackingStatus,
} from "../provider.interface";
import type { Emirate } from "@prisma/client";
import { getAllSettings } from "@/server/services/settings.service";

const NEAR_ZONE: Emirate[] = ["DUBAI", "SHARJAH", "AJMAN"];

function isNearZone(emirate: Emirate) {
  return NEAR_ZONE.includes(emirate);
}

export const manualShippingProvider: ShippingProvider = {
  name: "manual",

  async getRates(emirate: Emirate, subtotal: number): Promise<ShippingRateQuote[]> {
    // Rates are admin-editable at /admin/shipping — read live so a change
    // there takes effect on the very next checkout, no redeploy needed.
    const settings = await getAllSettings();
    const freeThreshold = Number(settings.freeShippingThreshold);

    if (subtotal >= freeThreshold) {
      return [{ method: "Standard Delivery", price: 0, estimatedDays: "2-4 days" }];
    }

    return isNearZone(emirate)
      ? [
          { method: "Standard Delivery", price: Number(settings.nearZoneShippingRate), estimatedDays: "2-3 days" },
          { method: "Express Delivery", price: Number(settings.nearZoneExpressRate), estimatedDays: "Next day" },
        ]
      : [{ method: "Standard Delivery", price: Number(settings.farZoneShippingRate), estimatedDays: "3-5 days" }];
  },

  async createShipment(input: ShipmentInput): Promise<CreatedShipment> {
    return { trackingNumber: null, trackingUrl: null, status: "PREPARING" };
  },

  async trackShipment(): Promise<TrackingStatus> {
    return { status: "Tracking is updated manually by our team" };
  },
};
