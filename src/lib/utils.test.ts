import { describe, it, expect } from "vitest";
import { formatAED } from "./utils";

// Assertions use regex rather than exact string equality because
// Intl.NumberFormat's exact spacing (regular vs. non-breaking space)
// between "AED" and the number can differ slightly across Node/ICU
// versions and operating systems — the numeric formatting is what matters.

describe("formatAED", () => {
  it("formats a number as AED currency", () => {
    expect(formatAED(1234.5)).toMatch(/AED\s*1,234\.50/);
  });

  it("formats a numeric string", () => {
    expect(formatAED("99.9")).toMatch(/AED\s*99\.90/);
  });

  it("formats zero correctly", () => {
    expect(formatAED(0)).toMatch(/AED\s*0\.00/);
  });

  it("rounds to two decimal places", () => {
    expect(formatAED(10.999)).toMatch(/AED\s*11\.00/);
  });
});
