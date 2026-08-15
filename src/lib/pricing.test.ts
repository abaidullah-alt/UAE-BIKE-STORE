import { describe, it, expect } from "vitest";
import { getEffectivePrice } from "./pricing";

describe("getEffectivePrice", () => {
  it("uses the regular price when there is no sale price", () => {
    const item = { variant: { priceOverride: null }, product: { price: 1000, salePrice: null } };
    expect(getEffectivePrice(item)).toBe(1000);
  });

  it("uses the sale price when one is set — this is the exact bug this test guards against", () => {
    const item = { variant: { priceOverride: null }, product: { price: 1000, salePrice: 950 } };
    expect(getEffectivePrice(item)).toBe(950);
  });

  it("a variant price override takes priority over both regular and sale price", () => {
    const item = { variant: { priceOverride: 800 }, product: { price: 1000, salePrice: 950 } };
    expect(getEffectivePrice(item)).toBe(800);
  });

  it("handles Decimal-like string values from the database correctly", () => {
    const item = { variant: { priceOverride: null }, product: { price: "1000.00", salePrice: "950.00" } };
    expect(getEffectivePrice(item)).toBe(950);
  });

  it("treats a salePrice of 0 as falsy and falls back to regular price (0 is not a valid sale price)", () => {
    const item = { variant: { priceOverride: null }, product: { price: 1000, salePrice: 0 } };
    expect(getEffectivePrice(item)).toBe(1000);
  });
});
