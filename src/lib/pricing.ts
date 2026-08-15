/**
 * Single source of truth for "what price does this cart/order line item
 * actually charge." Used by cart totals, order creation, and every UI
 * spot that displays a line-item price — so a sale price set on a
 * product is honored consistently everywhere, not just on the product
 * page.
 *
 * Uses a type-only import of Prisma.Decimal (Prisma's type for money
 * columns) — type-only imports are fully erased by TypeScript at compile
 * time, so this adds zero runtime code and stays safe to import from
 * client components, even though the type itself comes from Prisma.
 */
import type { Prisma } from "@prisma/client";

type Money = number | string | Prisma.Decimal | null;

interface PriceableItem {
  variant: {
    priceOverride: Money;
  };
  product: {
    price: Exclude<Money, null>;
    salePrice: Money;
  };
}

/**
 * Precedence: a variant-specific price override wins if set, otherwise
 * an active sale price, otherwise the regular price. This exact
 * precedence must be used everywhere a price is calculated or shown —
 * product page, cart, checkout, and order creation — so what a customer
 * sees never differs from what they're actually charged.
 */
export function getEffectivePrice(item: PriceableItem): number {
  if (item.variant.priceOverride) return Number(item.variant.priceOverride);
  if (item.product.salePrice) return Number(item.product.salePrice);
  return Number(item.product.price);
}
