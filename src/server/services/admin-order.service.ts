import { prisma } from "@/lib/db/prisma";
import type { OrderStatus, Prisma } from "@prisma/client";

export async function listAdminOrders(params: { status?: OrderStatus; search?: string; page?: number; pageSize?: number }) {
  const { status, search, page = 1, pageSize = 20 } = params;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { shippingFullName: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, payments: true, shipment: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { include: { refunds: true } },
      shipment: true,
      user: { select: { email: true, fullName: true } },
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await prisma.order.update({ where: { id }, data: { status } });
}

export async function updateShipmentTracking(
  orderId: string,
  data: { trackingNumber?: string; trackingUrl?: string; status?: "PREPARING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_DELIVERY" | "RETURNED" }
) {
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) throw new Error("No shipment record for this order");

  await prisma.shipment.update({
    where: { orderId },
    data: {
      ...data,
      shippedAt: data.status === "SHIPPED" ? new Date() : undefined,
      deliveredAt: data.status === "DELIVERED" ? new Date() : undefined,
    },
  });
}

export async function getOrderCountsByStatus() {
  const counts = await prisma.order.groupBy({ by: ["status"], _count: true });
  return Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<OrderStatus, number>;
}
