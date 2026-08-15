import Link from "next/link";
import { getOrCreateCart, calculateCartTotals } from "@/server/services/cart.service";
import { CartItemRow } from "./cart-item-row";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/utils";

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const { subtotal, taxTotal } = calculateCartTotals(cart);
  const grandTotal = subtotal + taxTotal;

  if (activeItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2">Browse our bikes and gear to get started.</p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {activeItems.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatAED(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT</span>
              <span>{formatAED(taxTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-slate-400">Calculated at checkout</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{formatAED(grandTotal)}</span>
          </div>
          <Button size="lg" className="w-full mt-6" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
          <Link href="/shop" className="block text-center text-sm text-orange-600 hover:underline mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
