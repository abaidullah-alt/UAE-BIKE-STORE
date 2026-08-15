import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth.config";
import { getEffectivePrice as getEffectivePriceShared } from "@/lib/pricing";

const CART_COOKIE = "cart_session";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" as const } } } },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies import("@prisma/client").Prisma.CartInclude;

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>;

/**
 * Resolves the current cart for either a logged-in user or a guest,
 * creating one if it doesn't exist yet. Guest carts are tracked via a
 * signed-ish random session token stored in an httpOnly cookie.
 */
export async function getOrCreateCart(): Promise<
  NonNullable<Awaited<ReturnType<typeof prisma.cart.findUnique>>> & {
    items: Array<
      import("@prisma/client").CartItem & {
        variant: import("@prisma/client").ProductVariant & {
          product: import("@prisma/client").Product & {
            images: import("@prisma/client").ProductImage[];
          };
          inventory: import("@prisma/client").Inventory | null;
        };
      }
    >;
  }
> {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user) {
    const userId = (session.user as { id: string }).id;
    let cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: cartInclude });
    }
    return cart;
  }

  let token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  let cart = await prisma.cart.findUnique({ where: { sessionToken: token }, include: cartInclude });
  if (!cart) {
    cart = await prisma.cart.create({ data: { sessionToken: token }, include: cartInclude });
  }
  return cart;
}

export async function addItemToCart(variantId: string, quantity: number) {
  const cart = await getOrCreateCart();

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true },
  });
  if (!variant) throw new Error("Product option not found");

  const available =
    (variant.inventory?.quantityOnHand ?? 0) - (variant.inventory?.quantityReserved ?? 0);

  const existing = cart.items.find((i) => i.variantId === variantId);
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (newQuantity > available) {
    throw new Error(`Only ${available} in stock`);
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    });
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return;
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { variant: { include: { inventory: true } } },
  });
  if (!item) return;

  const available =
    (item.variant.inventory?.quantityOnHand ?? 0) - (item.variant.inventory?.quantityReserved ?? 0);
  const clamped = Math.min(quantity, Math.max(available, 1));

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: clamped } });
}

export async function removeCartItem(cartItemId: string) {
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

export function calculateCartTotals(cart: CartWithItems) {
  const items = cart.items.filter((i) => !i.savedForLater);

  const subtotal = items.reduce((sum, item) => {
    return sum + getEffectivePriceShared({ variant: item.variant, product: item.variant.product }) * item.quantity;
  }, 0);

  const taxTotal = items.reduce((sum, item) => {
    const taxRate = Number(item.variant.product.taxRate) / 100;
    return sum + getEffectivePriceShared({ variant: item.variant, product: item.variant.product }) * item.quantity * taxRate;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, taxTotal, itemCount };
}

/** Lightweight count for the header badge — avoids fetching full cart data. */
export async function getCartItemCount(): Promise<number> {
  try {
    const cart = await getOrCreateCart();
    return cart.items
      .filter((i) => !i.savedForLater)
      .reduce((sum, i) => sum + i.quantity, 0);
  } catch {
    return 0;
  }
}
