import Link from "next/link";
import { getDashboardStats, getRecentOrders, getTopProducts } from "@/server/services/admin-dashboard.service";
import { formatAED } from "@/lib/utils";
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, Clock, RotateCcw, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, topProducts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getTopProducts(),
  ]);

  const cards = [
    { label: "Today's Sales", value: formatAED(stats.todaySales), icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Total Sales", value: formatAED(stats.totalSales), icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Orders", value: stats.orderCount, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Customers", value: stats.customerCount, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Products", value: stats.productCount, icon: Package, color: "text-slate-600 bg-slate-100" },
    { label: "Low Stock", value: stats.lowStockCount, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Pending Orders", value: stats.pendingOrderCount, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
    { label: "Pending Returns", value: stats.pendingReturnCount, icon: RotateCcw, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{card.value}</p>
            <p className="text-xs text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-orange-600 hover:underline">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex justify-between items-center py-2.5 text-sm hover:text-orange-600"
                >
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="text-slate-500">{order.items.length} items</span>
                  <span className="font-medium">{formatAED(order.grandTotal.toString())}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p) => (
                <div key={p.name} className="flex justify-between items-center py-2.5 text-sm">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="text-slate-500">{p.unitsSold} sold</span>
                  <span className="font-medium text-slate-800">{formatAED(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
