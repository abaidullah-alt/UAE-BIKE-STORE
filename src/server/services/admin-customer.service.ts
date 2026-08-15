import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function listCustomers(params: { search?: string; page?: number; pageSize?: number }) {
  const { search, page = 1, pageSize = 20 } = params;

  const where: Prisma.UserWhereInput = {
    roleId: null, // staff accounts have a role; customers don't
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { orders: { select: { grandTotal: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const withStats = items.map((user) => ({
    ...user,
    orderCount: user.orders.length,
    totalSpent: user.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.grandTotal), 0),
  }));

  return { items: withStats, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getCustomerById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: true,
    },
  });
}

export async function setCustomerStatus(id: string, status: "ACTIVE" | "SUSPENDED") {
  await prisma.user.update({ where: { id }, data: { status } });
}
