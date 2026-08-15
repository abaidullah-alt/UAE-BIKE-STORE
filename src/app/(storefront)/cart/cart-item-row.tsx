"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatAED } from "@/lib/utils";
import { getEffectivePrice } from "@/lib/pricing";
import { updateCartItemAction, removeCartItemAction } from "@/server/actions/cart";
import type { CartWithItems } from "@/server/services/cart.service";

export function CartItemRow({ item }: { item: CartWithItems["items"][number] }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();
  const image = item.variant.product.images[0];
  const price = getEffectivePrice({ variant: item.variant, product: item.variant.product });
  const onSale = Boolean(item.variant.product.salePrice) && !item.variant.priceOverride;
  const available =
    (item.variant.inventory?.quantityOnHand ?? 0) - (item.variant.inventory?.quantityReserved ?? 0);

  function changeQuantity(next: number) {
    if (next < 1) return;
    setQuantity(next);
    startTransition(() => {
      updateCartItemAction(item.id, next);
    });
  }

  function handleRemove() {
    startTransition(() => {
      removeCartItemAction(item.id);
    });
  }

  return (
    <div className={`flex gap-4 py-6 ${isPending ? "opacity-60" : ""}`}>
      <Link href={`/products/${item.variant.product.slug}`} className="h-24 w-24 shrink-0 rounded-lg bg-slate-100 relative overflow-hidden">
        {image ? (
          <Image src={image.url} alt={image.altText ?? item.variant.product.name} fill className="object-cover" sizes="96px" />
        ) : null}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${item.variant.product.slug}`} className="font-semibold text-slate-900 hover:text-orange-600 line-clamp-1">
              {item.variant.product.name}
            </Link>
            {item.variant.optionLabel !== "Standard" && (
              <p className="text-sm text-slate-500">{item.variant.optionLabel}</p>
            )}
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-orange-600 font-semibold">{formatAED(price)}</p>
              {onSale && (
                <p className="text-slate-400 text-xs line-through">{formatAED(Number(item.variant.product.price))}</p>
              )}
            </div>
          </div>
          <button onClick={handleRemove} className="text-slate-400 hover:text-red-600 shrink-0" aria-label="Remove item">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-slate-300 rounded-md">
            <button
              className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-orange-600 disabled:opacity-40"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={quantity <= 1 || isPending}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-orange-600 disabled:opacity-40"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={quantity >= available || isPending}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm text-slate-400">{formatAED(price * quantity)} total</span>
        </div>
      </div>
    </div>
  );
}
