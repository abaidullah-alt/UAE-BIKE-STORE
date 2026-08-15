"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { recommendFrameSize, SIZE_CHART } from "@/lib/bike-size";

export default function SizeGuidePage() {
  const [height, setHeight] = useState("");
  const heightNum = parseFloat(height);
  const recommendation = recommendFrameSize(heightNum);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <Ruler className="h-10 w-10 text-orange-600 mx-auto" />
        <h1 className="text-3xl font-bold text-slate-900 mt-3">Bike Size Guide</h1>
        <p className="text-slate-500 mt-2">
          Getting the right frame size matters more than almost anything else for comfort and control. Use the calculator below, or the reference chart underneath.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label htmlFor="height" className="text-sm font-medium text-slate-700">
          Your height (cm)
        </label>
        <input
          id="height"
          type="number"
          placeholder="e.g. 175"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 text-lg"
        />
        {recommendation && (
          <p className="mt-4 text-center text-lg">
            Recommended frame size:{" "}
            <span className="font-bold text-orange-600">{recommendation}</span>
          </p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-slate-900 mb-4">Reference Chart</h2>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Height Range (cm)</th>
                <th className="px-4 py-2 font-medium">Recommended Frame Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SIZE_CHART.map((row) => (
                <tr key={row.size}>
                  <td className="px-4 py-2.5 text-slate-700">{row.min}–{row.max} cm</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{row.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-slate-400 mt-8 text-center">
        This is a general guide suitable for most road and hybrid bikes. Inseam length,
        riding style, and specific bike geometry can shift the ideal size — for mountain
        bikes especially, or if you're between sizes,{" "}
        <a href="/contact" className="text-orange-600 hover:underline">contact us</a>{" "}
        before ordering and we'll help you get it right.
      </p>
    </div>
  );
}
