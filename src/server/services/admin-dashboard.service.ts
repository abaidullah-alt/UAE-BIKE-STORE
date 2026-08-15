import { prisma } from "@/lib/db/prisma";

async function getLowStockCount() {
  // Prisma's client API can't compare two columns directly in a `where`
  // clause, so we fetch the (small) inventory table and filter in JS.
  // If inventory grows large, replace with a $queryRaw comparing the columns.
  const inventories = await prisma.inventory.findMany({
    select: { quantityOnHand: true, lowStockThreshold: true },
  });
  return inventories.filter((i) => i.quantityOnHand <= i.lowStockThreshold).length;
}

export async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    todaySales,
    totalSalesResult,
    orderCount,
    customerCount,
    productCount,
    lowStockCount,
    pendingOrderCount,
    pendingReturnCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday }, status: { notIn: ["CANCELLED"] } },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED"] } },
      _sum: { grandTotal: true },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { roleId: null } }), // customers only, not staff
    prisma.product.count(),
    getLowStockCount(),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING", "CONFIRMED"] } } }),
    prisma.order.count({ where: { status: { in: ["RETURN_REQUESTED", "REFUND_REQUESTED"] } } }),
  ]);

  return {
    todaySales: Number(todaySales._sum.grandTotal ?? 0),
    totalSales: Number(totalSalesResult._sum.grandTotal ?? 0),
    orderCount,
    customerCount,
    productCount,
    lowStockCount,
    pendingOrderCount,
    pendingReturnCount,
  };
}

export async function getRecentOrders(take = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { items: true },
  });
}

export async function getTopProducts(take = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  return grouped.map((g) => ({
    name: g.productName,
    unitsSold: g._sum.quantity ?? 0,
    revenue: Number(g._sum.lineTotal ?? 0),
  }));
}
