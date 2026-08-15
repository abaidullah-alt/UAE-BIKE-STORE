"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth.config";

async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId } });
  }
  return wishlist;
}

export async function toggleWishlist(productId: string): Promise<{ inWishlist: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Please log in to save items to your wishlist" };
  }
  const userId = (session.user as { id: string }).id;
  const wishlist = await getOrCreateWishlist(userId);

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { inWishlist: false };
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  revalidatePath("/account/wishlist");
  return { inWishlist: true };
}

export async function removeFromWishlist(wishlistItemId: string) {
  await prisma.wishlistItem.delete({ where: { id: wishlistItemId } });
  revalidatePath("/account/wishlist");
}
