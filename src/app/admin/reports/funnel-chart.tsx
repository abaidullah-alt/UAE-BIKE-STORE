"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Funnel {
  pageViews: number;
  productViews: number;
  addToCarts: number;
  checkoutsStarted: number;
  purchases: number;
}

const COLORS = ["#1e293b", "#334155", "#475569", "#ea580c", "#16a34a"];

export function FunnelChart({ funnel }: { funnel: Funnel }) {
  const data = [
    { stage: "Page Views", value: funnel.pageViews },
    { stage: "Product Views", value: funnel.productViews },
    { stage: "Added to Cart", value: funnel.addToCarts },
    { stage: "Checkout Started", value: funnel.checkoutsStarted },
    { stage: "Purchased", value: funnel.purchases },
  ];

  if (funnel.pageViews === 0) {
    return <p className="text-sm text-slate-400">No analytics data yet — browse the storefront a bit to generate some.</p>;
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#475569" }} width={110} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={entry.stage} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
