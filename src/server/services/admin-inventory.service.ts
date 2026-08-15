import { prisma } from "@/lib/db/prisma";

export async function listInventory(params: { lowStockOnly?: boolean; search?: string }) {
  const { lowStockOnly, search } = params;

  const variants = await prisma.productVariant.findMany({
    where: {
      product: search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] }
        : undefined,
    },
    include: { product: { select: { name: true, sku: true, slug: true } }, inventory: true },
    orderBy: { product: { name: "asc" } },
  });

  const filtered = lowStockOnly
    ? variants.filter((v) => v.inventory && v.inventory.quantityOnHand <= v.inventory.lowStockThreshold)
    : variants;

  return filtered;
}

export async function getInventoryHistory(variantId: string, take = 20) {
  const inventory = await prisma.inventory.findUnique({ where: { variantId } });
  if (!inventory) return [];
  return prisma.inventoryTransaction.findMany({
    where: { inventoryId: inventory.id },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function adjustStock(variantId: string, delta: number, reason: string, adminUserId?: string) {
  await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { variantId } });
    if (!inventory) throw new Error("No inventory record for this variant");

    const newQuantity = inventory.quantityOnHand + delta;
    if (newQuantity < 0) throw new Error("Stock cannot go below zero");

    await tx.inventory.update({ where: { variantId }, data: { quantityOnHand: newQuantity } });
    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: delta > 0 ? "STOCK_ADDED" : "MANUAL_ADJUSTMENT",
        quantity: delta,
        reason,
        createdBy: adminUserId,
      },
    });
  });
}
