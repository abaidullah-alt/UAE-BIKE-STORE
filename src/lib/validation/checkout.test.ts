import { describe, it, expect } from "vitest";
import { checkoutSchema } from "./checkout";

const validBase = {
  fullName: "Ahmed Al Farsi",
  email: "ahmed@example.com",
  phone: "0501234567",
  emirate: "DUBAI" as const,
  area: "Al Barsha",
  street: "Sheikh Zayed Road",
  buildingVilla: "Villa 12",
  paymentMethod: "cod" as const,
};

describe("checkoutSchema", () => {
  it("accepts a fully valid checkout payload", () => {
    const result = checkoutSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("accepts a UAE number with +971 country code", () => {
    const result = checkoutSchema.safeParse({ ...validBase, phone: "+971501234567" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number missing the leading 0 or +971", () => {
    const result = checkoutSchema.safeParse({ ...validBase, phone: "501234567" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UAE mobile prefix (must start with 5 after the country/trunk code)", () => {
    const result = checkoutSchema.safeParse({ ...validBase, phone: "0412345678" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that's too short", () => {
    const result = checkoutSchema.safeParse({ ...validBase, phone: "05012345" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = checkoutSchema.safeParse({ ...validBase, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid Emirate value", () => {
    const result = checkoutSchema.safeParse({ ...validBase, emirate: "TEXAS" });
    expect(result.success).toBe(false);
  });

  it("defaults payment method to cod when omitted (site is COD-only)", () => {
    const { paymentMethod, ...rest } = validBase;
    const result = checkoutSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentMethod).toBe("cod");
    }
  });

  it("rejects a payment method other than cod", () => {
    const result = checkoutSchema.safeParse({ ...validBase, paymentMethod: "online" });
    expect(result.success).toBe(false);
  });

  it("allows optional fields (apartment, delivery instructions, coupon) to be omitted", () => {
    const result = checkoutSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });
});
