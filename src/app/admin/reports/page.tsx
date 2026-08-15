import {
  getSalesOverTime,
  getRevenueSummary,
  getTopProductsReport,
  getRevenueByCategory,
  getCustomerReport,
  getInventoryReport,
  getConversionFunnel,
} from "@/server/services/admin-report.service";
import { formatAED } from "@/lib/utils";
import { SalesChart } from "./sales-chart";
import { CategoryChart } from "./category-chart";
import { FunnelChart } from "./funnel-chart";

export default async function AdminReportsPage() {
  const [sales, revenue, topProducts, byCategory, customers, inventory, funnel] = await Promise.all([
    getSalesOverTime(30),
    getRevenueSummary(),
    getTopProductsReport(),
    getRevenueByCategory(),
    getCustomerReport(),
    getInventoryReport(),
    getConversionFunnel(30),
  ]);

  const momChange = revenue.lastMonthRevenue > 0
    ? ((revenue.thisMonthRevenue - revenue.lastMonthRevenue) / revenue.lastMonthRevenue) * 100
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Reports</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{formatAED(revenue.thisMonthRevenue)}</p>
          <p className="text-xs text-slate-500">This Month&apos;s Revenue</p>
          {momChange !== null && (
            <p className={`text-xs mt-1 font-medium ${momChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {momChange >= 0 ? "+" : ""}{momChange.toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{formatAED(revenue.avgOrderValue)}</p>
          <p className="text-xs text-slate-500">Avg. Order Value</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{customers.totalCustomers}</p>
          <p className="text-xs text-slate-500">Total Customers</p>
          <p className="text-xs text-slate-400 mt-1">{customers.repeatCustomers} have ordered</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{inventory.lowStockCount + inventory.outOfStockCount}</p>
          <p className="text-xs text-slate-500">Items Needing Restock</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Conversion Funnel — Last 30 Days</h2>
          <span className="text-xs text-slate-400">
            {funnel.conversionRate.toFixed(2)}% page-view-to-purchase conversion
          </span>
        </div>
        <FunnelChart funnel={funnel} />
        <p className="text-xs text-slate-400 mt-3">
          Estimated {funnel.abandonedCartSessions} abandoned cart session{funnel.abandonedCartSessions === 1 ? "" : "s"} in this period (added to cart, never completed checkout).
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Sales — Last 30 Days</h2>
        <SalesChart data={sales} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Revenue by Category</h2>
          <CategoryChart data={byCategory} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p) => (
                <div key={p.name} className="flex justify-between py-2.5 text-sm">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="text-slate-500">{p.unitsSold} sold</span>
                  <span className="font-medium text-slate-800">{formatAED(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top Customers</h2>
          {customers.topSpenders.length === 0 ? (
            <p className="text-sm text-slate-400">No customer orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {customers.topSpenders.map((c) => (
                <div key={c.email} className="flex justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.orderCount} order{c.orderCount === 1 ? "" : "s"}</p>
                  </div>
                  <span className="font-medium text-slate-800">{formatAED(c.totalSpent)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Stock Alerts</h2>
          {inventory.outOfStockItems.length === 0 && inventory.lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-400">All products are well stocked.</p>
          ) : (
            <div className="space-y-1">
              {inventory.outOfStockItems.map((item) => (
                <div key={item.sku} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-red-600 font-medium text-xs">Out of Stock</span>
                </div>
              ))}
              {inventory.lowStockItems.map((item) => (
                <div key={item.sku} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-yellow-600 font-medium text-xs">{item.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
