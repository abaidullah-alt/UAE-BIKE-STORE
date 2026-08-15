// Generic road/mountain bike frame-size-by-height chart (in cm). A
// reasonable general-purpose default; swap for a brand-specific chart if a
// supplier provides one for a given product line.
export const SIZE_CHART = [
  { min: 150, max: 160, size: "XS (49–50cm)" },
  { min: 160, max: 168, size: "S (51–53cm)" },
  { min: 168, max: 175, size: "M (54–56cm)" },
  { min: 175, max: 183, size: "L (57–58cm)" },
  { min: 183, max: 191, size: "XL (59–61cm)" },
  { min: 191, max: 210, size: "XXL (62cm+)" },
];

export function recommendFrameSize(heightCm: number): string | null {
  if (!isFinite(heightCm) || heightCm <= 0) return null;
  return SIZE_CHART.find((row) => heightCm >= row.min && heightCm < row.max)?.size ?? null;
}
