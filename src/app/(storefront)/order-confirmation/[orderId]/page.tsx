import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderById } from "@/server/services/order.service";
import { Button } from "@/components/ui/button";
import { formatAED } from "@/lib/utils";
import { emirateLabels } from "@/lib/validation/checkout";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto" />
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Order Confirmed!</h1>
        <p className="text-slate-500 mt-2">
          Thank you — your order <span className="font-semibold text-slate-800">{order.orderNumber}</span> has been placed.
        </p>
        {order.status === "PAYMENT_PENDING" && (
          <p className="text-sm text-orange-600 mt-2 bg-orange-50 border border-orange-200 rounded-md p-3 max-w-md mx-auto">
            Our team will contact you shortly to complete online payment for this order.
          </p>
        )}
      </div>

      <div className="mt-10 border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Order Details</h2>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.productName}</p>
                <p className="text-slate-500">Qty {item.quantity}</p>
              </div>
              <p className="font-medium text-slate-800">{formatAED(item.lineTotal.toString())}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatAED(order.subtotal.toString())}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VAT</span>
            <span>{formatAED(order.taxTotal.toString())}</span>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatAED(order.discountTotal.toString())}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{Number(order.shippingTotal) === 0 ? "Free" : formatAED(order.shippingTotal.toString())}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>{formatAED(order.grandTotal.toString())}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-900 mb-3">Delivery Address</h2>
        <p className="text-sm text-slate-600">
          {order.shippingFullName}<br />
          {order.shippingStreet}, {order.shippingBuilding}
          {order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
          {order.shippingArea}, {emirateLabels[order.shippingEmirate]}<br />
          {order.shippingPhone}
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <Button variant="outline" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account/orders">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
}
