import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/server/services/admin-order.service";
import { formatAED } from "@/lib/utils";
import { emirateLabels } from "@/lib/validation/checkout";
import { OrderStatusUpdater } from "./order-status-updater";
import { TrackingForm } from "./tracking-form";
import { RefundForm } from "./refund-form";
import { MarkPaidButton } from "./mark-paid-button";
import { AlertCircle } from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  // For Cash on Delivery orders, the cash is only actually collected once
  // the courier hands over the parcel — this banner is the visible
  // reminder to confirm that collection once the order has gone out for
  // delivery or later, so payments don't get silently forgotten as "Pending".
  const shippedOrLater = ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
  const unpaidPayment = order.payments.find(
    (p) => p.status !== "PAID" && p.status !== "REFUNDED" && p.status !== "PARTIALLY_REFUNDED"
  );
  const needsPaymentConfirmation = shippedOrLater && unpaidPayment;

  return (
    <div>
      {needsPaymentConfirmation && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6">
          <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">
              This order has been delivered but payment hasn&apos;t been confirmed yet.
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              If the customer has paid cash on delivery, confirm it below in the Payment section.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString("en-AE")}
          </p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Items</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-slate-500">{item.variantLabel} · Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-slate-800">{formatAED(item.lineTotal.toString())}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatAED(order.subtotal.toString())}</span></div>
            <div className="flex justify-between text-slate-600"><span>VAT</span><span>{formatAED(order.taxTotal.toString())}</span></div>
            {Number(order.discountTotal) > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatAED(order.discountTotal.toString())}</span></div>
            )}
            <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{formatAED(order.shippingTotal.toString())}</span></div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span><span>{formatAED(order.grandTotal.toString())}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Customer & Delivery</h2>
            <p className="text-sm text-slate-600">
              {order.shippingFullName}<br />
              {order.shippingPhone}<br />
              {order.user?.email ?? order.guestEmail}
            </p>
            <p className="text-sm text-slate-600 mt-3">
              {order.shippingStreet}, {order.shippingBuilding}
              {order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
              {order.shippingArea}, {emirateLabels[order.shippingEmirate]}
            </p>
            {order.shippingInstructions && (
              <p className="text-sm text-slate-500 mt-2 italic">&ldquo;{order.shippingInstructions}&rdquo;</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Shipment Tracking</h2>
            <TrackingForm
              orderId={order.id}
              currentTrackingNumber={order.shipment?.trackingNumber ?? ""}
              currentTrackingUrl={order.shipment?.trackingUrl ?? ""}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Payment</h2>
            {order.payments.map((payment) => (
              <div key={payment.id} className="text-sm mb-3">
                <p className="text-slate-700">
                  {payment.provider === "cod" ? "Cash on Delivery" : "Online"} · {formatAED(payment.amount.toString())} · {payment.status}
                </p>
                {payment.refunds.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Refunded: {formatAED(payment.refunds.reduce((s, r) => s + Number(r.amount), 0))}
                  </p>
                )}
                {payment.status !== "REFUNDED" && payment.status !== "PARTIALLY_REFUNDED" && payment.status !== "PAID" && (
                  <MarkPaidButton paymentId={payment.id} />
                )}
                {payment.status !== "REFUNDED" && (
                  <RefundForm paymentId={payment.id} maxAmount={Number(payment.amount)} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
