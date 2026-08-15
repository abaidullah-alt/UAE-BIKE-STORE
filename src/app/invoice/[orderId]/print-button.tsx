"use client";

export function PrintButton() {
  return (
    <div className="print:hidden text-center mt-6">
      <button onClick={() => window.print()} className="text-sm font-medium text-orange-600 hover:underline">
        Print / Save as PDF
      </button>
    </div>
  );
}
