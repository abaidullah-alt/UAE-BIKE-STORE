import { describe, it, expect } from "vitest";
import { recommendFrameSize } from "./bike-size";

describe("recommendFrameSize", () => {
  it("recommends XS for a short rider", () => {
    expect(recommendFrameSize(155)).toBe("XS (49–50cm)");
  });

  it("recommends M for an average-height rider", () => {
    expect(recommendFrameSize(170)).toBe("M (54–56cm)");
  });

  it("recommends XXL for a very tall rider", () => {
    expect(recommendFrameSize(195)).toBe("XXL (62cm+)");
  });

  it("returns null for an invalid (NaN) height", () => {
    expect(recommendFrameSize(NaN)).toBeNull();
  });

  it("returns null for a non-positive height", () => {
    expect(recommendFrameSize(0)).toBeNull();
    expect(recommendFrameSize(-10)).toBeNull();
  });

  it("returns null for a height outside the supported chart range", () => {
    expect(recommendFrameSize(50)).toBeNull();
  });

  it("handles the boundary between two size bands correctly", () => {
    expect(recommendFrameSize(160)).toBe("S (51–53cm)"); // exactly on the S/XS boundary
    expect(recommendFrameSize(159.9)).toBe("XS (49–50cm)");
  });
});
