import { redirect } from "next/navigation";
import { getOrCreateCart, calculateCartTotals } from "@/server/services/cart.service";
import { getEffectivePrice } from "@/lib/pricing";
import { CheckoutForm } from "./checkout-form";
import { formatAED } from "@/lib/utils";
import Image from "next/image";

export default async function CheckoutPage() {
  const cart = await getOrCreateCart();
  const activeItems = cart.items.filter((i) => !i.savedForLater);

  if (activeItems.length === 0) {
    redirect("/cart");
  }

  const { subtotal, taxTotal } = calculateCartTotals(cart);
  const shippingTotal = subtotal >= 500 ? 0 : 25;
  const grandTotal = subtotal + taxTotal + shippingTotal;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        <CheckoutForm />

        <div className="border border-slate-200 rounded-xl p-6 h-fit order-first lg:order-last">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeItems.map((item) => {
              const price = getEffectivePrice({ variant: item.variant, product: item.variant.product });
              const image = item.variant.product.images[0];
              return (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="h-14 w-14 rounded-md bg-slate-100 relative overflow-hidden shrink-0">
                    {image && (
                      <Image src={image.url} alt={item.variant.product.name} fill className="object-cover" sizes="56px" />
                    )}
                    <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 line-clamp-1">{item.variant.product.name}</p>
                    <p className="text-slate-500">{formatAED(price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 mt-4 pt-4 space-y-2 text-sm">
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
              <span>{shippingTotal === 0 ? "Free" : formatAED(shippingTotal)}</span>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{formatAED(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
