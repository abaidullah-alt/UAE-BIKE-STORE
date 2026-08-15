"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/utils";
import { Heart, Minus, Plus } from "lucide-react";
import { addToCartAction } from "@/server/actions/cart";
import { toggleWishlist } from "@/server/actions/wishlist";
import { trackEvent } from "@/lib/analytics/track";
import type { ProductDetail } from "@/server/services/catalog.service";

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.isDefault)?.id ?? product.variants[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [wishlistState, setWishlistState] = useState<"idle" | "saved">("idle");

  async function handleToggleWishlist() {
    const result = await toggleWishlist(product.id);
    if ("error" in result) {
      router.push("/login");
      return;
    }
    setWishlistState(result.inWishlist ? "saved" : "idle");
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.priceOverride ?? product.salePrice ?? product.price;
  const originalPrice = product.salePrice ? product.price : null;

  const available =
    (selectedVariant?.inventory?.quantityOnHand ?? 0) -
    (selectedVariant?.inventory?.quantityReserved ?? 0);
  const inStock = available > 0;

  const hasRealVariants = product.variants.length > 1;

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    setError(null);
    setIsPending(true);
    const result = await addToCartAction(selectedVariantId, quantity);
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    trackEvent("ADD_TO_CART", { productId: product.id, productName: product.name, quantity });
    setJustAdded(true);
    router.refresh(); // updates header cart count
    setTimeout(() => setJustAdded(false), 2000);
  }

  async function handleBuyNow() {
    if (!selectedVariantId) return;
    setError(null);
    setIsPending(true);
    const result = await addToCartAction(selectedVariantId, quantity);
    setIsPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-orange-600">{formatAED(price.toString())}</span>
        {originalPrice && (
          <span className="text-lg text-slate-400 line-through">{formatAED(originalPrice.toString())}</span>
        )}
      </div>

      <p className={`text-sm mt-2 font-medium ${inStock ? "text-green-600" : "text-red-600"}`}>
        {inStock ? `In stock (${available} available)` : "Out of stock"}
      </p>

      {hasRealVariants && (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-800 mb-2">Options</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={`px-4 py-2 rounded-md border text-sm font-medium ${
                  selectedVariantId === variant.id
                    ? "border-orange-600 bg-orange-50 text-orange-700"
                    : "border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                {variant.optionLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center border border-slate-300 rounded-md">
          <button
            className="h-11 w-11 flex items-center justify-center text-slate-600 hover:text-orange-600 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <button
            className="h-11 w-11 flex items-center justify-center text-slate-600 hover:text-orange-600"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button size="lg" className="flex-1" disabled={!inStock || isPending} onClick={handleAddToCart}>
          {justAdded ? "Added to Cart ✓" : isPending ? "Adding..." : "Add to Cart"}
        </Button>

        <button
          onClick={handleToggleWishlist}
          className={`h-11 w-11 flex items-center justify-center rounded-md border ${
            wishlistState === "saved"
              ? "border-orange-400 text-orange-600 bg-orange-50"
              : "border-slate-300 text-slate-600 hover:text-orange-600 hover:border-orange-400"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`h-5 w-5 ${wishlistState === "saved" ? "fill-orange-600" : ""}`} />
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <Button size="lg" variant="secondary" className="w-full mt-3" disabled={!inStock || isPending} onClick={handleBuyNow}>
        Buy Now
      </Button>

      <div className="mt-6 text-sm text-slate-500 space-y-1">
        <p>🚚 Delivery across all UAE Emirates — estimated 2–5 business days</p>
        <p>↩️ 14-day returns on unused items</p>
        <p>💳 Cash on Delivery or secure online payment</p>
      </div>
    </div>
  );
}
