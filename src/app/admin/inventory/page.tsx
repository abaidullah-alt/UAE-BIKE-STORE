import Link from "next/link";
import { listInventory } from "@/server/services/admin-inventory.service";
import { StockAdjuster } from "./stock-adjuster";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lowStock?: string }>;
}) {
  const { q, lowStock } = await searchParams;
  const items = await listInventory({ search: q, lowStockOnly: lowStock === "1" });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Inventory</h1>
      <p className="text-sm text-slate-500 mb-6">{items.length} variant{items.length === 1 ? "" : "s"}</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form className="flex-1 max-w-sm">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by product name or SKU..."
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
          />
        </form>
        <Link
          href={lowStock === "1" ? "/admin/inventory" : "/admin/inventory?lowStock=1"}
          className={`text-xs font-medium px-3 py-2 rounded-md border ${
            lowStock === "1" ? "bg-red-600 text-white border-red-600" : "border-slate-300 text-slate-600"
          }`}
        >
          {lowStock === "1" ? "Showing Low Stock Only" : "Show Low Stock Only"}
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">On Hand</th>
              <th className="px-4 py-3 font-medium">Reserved</th>
              <th className="px-4 py-3 font-medium">Available</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((variant) => {
              const onHand = variant.inventory?.quantityOnHand ?? 0;
              const reserved = variant.inventory?.quantityReserved ?? 0;
              const threshold = variant.inventory?.lowStockThreshold ?? 5;
              const available = onHand - reserved;
              const isLow = onHand <= threshold;
              const isOut = onHand === 0;

              return (
                <tr key={variant.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {variant.product.name}
                    {variant.optionLabel !== "Standard" && (
                      <span className="text-slate-400 font-normal"> · {variant.optionLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{variant.sku}</td>
                  <td className="px-4 py-3 text-slate-800">{onHand}</td>
                  <td className="px-4 py-3 text-slate-500">{reserved}</td>
                  <td className="px-4 py-3 text-slate-800">{available}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isOut ? "bg-red-100 text-red-700" : isLow ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StockAdjuster variantId={variant.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No products found.</p>}
      </div>
    </div>
  );
}
