import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@prisma/client";

// Deliberately NOT `as const` — Prisma's `notIn` filter expects a mutable
// OrderStatus[], and `as const` produces a readonly tuple that TypeScript
// won't allow there even though nothing actually mutates this array.
const EXCLUDED_STATUSES: OrderStatus[] = ["CANCELLED"];

export async function getSalesOverTime(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate }, status: { notIn: EXCLUDED_STATUSES } },
    select: { createdAt: true, grandTotal: true },
  });

  // Bucket by day
  const buckets = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue += Number(order.grandTotal);
      bucket.orders += 1;
    }
  }

  return Array.from(buckets.values());
}

export async function getRevenueSummary() {
  const [thisMonth, lastMonth, allTime] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        status: { notIn: EXCLUDED_STATUSES },
      },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        status: { notIn: EXCLUDED_STATUSES },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: { status: { notIn: EXCLUDED_STATUSES } },
      _sum: { grandTotal: true },
      _count: true,
    }),
  ]);

  return {
    thisMonthRevenue: Number(thisMonth._sum.grandTotal ?? 0),
    thisMonthOrders: thisMonth._count,
    lastMonthRevenue: Number(lastMonth._sum.grandTotal ?? 0),
    allTimeRevenue: Number(allTime._sum.grandTotal ?? 0),
    allTimeOrders: allTime._count,
    avgOrderValue: allTime._count > 0 ? Number(allTime._sum.grandTotal ?? 0) / allTime._count : 0,
  };
}

export async function getTopProductsReport(take = 10) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take,
  });
  return grouped.map((g) => ({
    name: g.productName,
    unitsSold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.lineTotal ?? 0),
  }));
}

export async function getRevenueByCategory() {
  const items = await prisma.orderItem.findMany({
    select: {
      lineTotal: true,
      quantity: true,
      variant: { select: { product: { select: { category: { select: { name: true } } } } } },
    },
  });

  const byCategory = new Map<string, { category: string; revenue: number; units: number }>();
  for (const item of items) {
    const categoryName = item.variant.product.category.name;
    const existing = byCategory.get(categoryName) ?? { category: categoryName, revenue: 0, units: 0 };
    existing.revenue += Number(item.lineTotal);
    existing.units += item.quantity;
    byCategory.set(categoryName, existing);
  }

  return Array.from(byCategory.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getCustomerReport() {
  const [totalCustomers, repeatCustomers] = await Promise.all([
    prisma.user.count({ where: { roleId: null } }),
    prisma.user.count({
      where: { roleId: null, orders: { some: {} } },
    }),
  ]);

  const topSpenders = await prisma.user.findMany({
    where: { roleId: null, orders: { some: {} } },
    include: { orders: { where: { status: { notIn: EXCLUDED_STATUSES } }, select: { grandTotal: true } } },
    take: 50,
  });

  const ranked = topSpenders
    .map((c) => ({
      name: c.fullName,
      email: c.email,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0),
      orderCount: c.orders.length,
    }))
    .filter((c) => c.orderCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return { totalCustomers, repeatCustomers, topSpenders: ranked };
}

export async function getConversionFunnel(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [pageViews, productViews, addToCarts, checkoutsStarted, purchases] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "PAGE_VIEW", createdAt: { gte: startDate } } }),
    prisma.analyticsEvent.count({ where: { type: "PRODUCT_VIEW", createdAt: { gte: startDate } } }),
    prisma.analyticsEvent.count({ where: { type: "ADD_TO_CART", createdAt: { gte: startDate } } }),
    prisma.analyticsEvent.count({ where: { type: "CHECKOUT_STARTED", createdAt: { gte: startDate } } }),
    prisma.analyticsEvent.count({ where: { type: "PURCHASE", createdAt: { gte: startDate } } }),
  ]);

  // Abandoned cart estimate: distinct sessions that added to cart but never purchased
  const addToCartSessions = await prisma.analyticsEvent.findMany({
    where: { type: "ADD_TO_CART", createdAt: { gte: startDate } },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });
  const purchaseSessions = await prisma.analyticsEvent.findMany({
    where: { type: "PURCHASE", createdAt: { gte: startDate } },
    select: { sessionId: true },
    distinct: ["sessionId"],
  });
  const purchasedSessionIds = new Set(purchaseSessions.map((s) => s.sessionId));
  const abandonedCartSessions = addToCartSessions.filter((s) => !purchasedSessionIds.has(s.sessionId)).length;

  return {
    pageViews,
    productViews,
    addToCarts,
    checkoutsStarted,
    purchases,
    conversionRate: pageViews > 0 ? (purchases / pageViews) * 100 : 0,
    abandonedCartSessions,
  };
}

export async function getInventoryReport() {
  const inventories = await prisma.inventory.findMany({
    include: { variant: { include: { product: { select: { name: true, sku: true } } } } },
  });

  const lowStock = inventories.filter((i) => i.quantityOnHand <= i.lowStockThreshold && i.quantityOnHand > 0);
  const outOfStock = inventories.filter((i) => i.quantityOnHand === 0);
  const totalUnits = inventories.reduce((sum, i) => sum + i.quantityOnHand, 0);

  return {
    totalUnits,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStockItems: lowStock.map((i) => ({ name: i.variant.product.name, sku: i.variant.product.sku, quantity: i.quantityOnHand })),
    outOfStockItems: outOfStock.map((i) => ({ name: i.variant.product.name, sku: i.variant.product.sku })),
  };
}
