import { describe, it, expect } from "vitest";
import { slugify } from "./text";

describe("slugify", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(slugify("TrailForge Summit Pro")).toBe("trailforge-summit-pro");
  });

  it("collapses multiple spaces/symbols into a single hyphen", () => {
    expect(slugify("Kids'  Bike -- 20\"")).toBe("kids-bike-20");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Electric Bike-  ")).toBe("electric-bike");
  });

  it("handles already-clean slugs unchanged", () => {
    expect(slugify("mountain-bikes")).toBe("mountain-bikes");
  });

  it("handles numbers correctly", () => {
    expect(slugify("29\" Wheel Size")).toBe("29-wheel-size");
  });
});
