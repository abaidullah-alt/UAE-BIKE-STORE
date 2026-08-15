"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { recommendFrameSize } from "@/lib/bike-size";

export function BikeSizeGuide() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState("");

  const heightNum = parseFloat(height);
  const recommendation = recommendFrameSize(heightNum);

  return (
    <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left"
      >
        <Ruler className="h-4 w-4 text-orange-600" />
        <span className="font-medium text-slate-900 text-sm">Find Your Bike Size</span>
      </button>

      {open && (
        <div className="p-4">
          <label className="text-sm font-medium text-slate-700" htmlFor="rider-height">
            Your height (cm)
          </label>
          <div className="flex gap-2 mt-2">
            <input
              id="rider-height"
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm"
            />
          </div>

          {recommendation && (
            <p className="mt-3 text-sm text-slate-700">
              Recommended frame size:{" "}
              <span className="font-semibold text-orange-600">{recommendation}</span>
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            This is a general guide. For a precise fit, inseam length and
            riding style also matter — feel free to contact us for advice
            before ordering.
          </p>
        </div>
      )}
    </div>
  );
}
