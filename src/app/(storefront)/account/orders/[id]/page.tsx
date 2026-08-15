import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/require-admin";
import { getOrderById } from "@/server/services/order.service";
import { formatAED } from "@/lib/utils";
import { emirateLabels } from "@/lib/validation/checkout";
import { Truck, CheckCircle2, Package, Clock } from "lucide-react";

const STATUS_STEPS = ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

const stepIcons = {
  CONFIRMED: Clock,
  PROCESSING: Package,
  PACKED: Package,
  SHIPPED: Truck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCustomerSession();
  const userId = (session.user as { id: string }).id;

  const order = await getOrderById(id);
  if (!order || order.userId !== userId) notFound();

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);
  const isCancelledOrReturn = ["CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUND_REQUESTED", "REFUNDED"].includes(order.status);

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-orange-600 hover:underline mb-4 inline-block">
        ← Back to Orders
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-AE", { dateStyle: "long" })}
          </p>
        </div>
        <Link
          href={`/invoice/${order.id}`}
          target="_blank"
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          View Invoice
        </Link>
      </div>

      {!isCancelledOrReturn && (
        <div className="border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const Icon = stepIcons[step];
              const isComplete = i <= currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                        i <= currentStepIndex ? "bg-orange-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isComplete ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[11px] mt-2 text-center ${isComplete ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
          {order.shipment?.trackingNumber && (
            <p className="text-sm text-slate-600 mt-6 text-center">
              Tracking number: <span className="font-medium">{order.shipment.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      {isCancelledOrReturn && (
        <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">Status: {order.status.replace(/_/g, " ")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Items</h2>
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
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{formatAED(order.grandTotal.toString())}</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Delivery Address</h2>
          <p className="text-sm text-slate-600">
            {order.shippingFullName}<br />
            {order.shippingStreet}, {order.shippingBuilding}
            {order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
            {order.shippingArea}, {emirateLabels[order.shippingEmirate]}<br />
            {order.shippingPhone}
          </p>

          <h2 className="font-semibold text-slate-900 mt-6 mb-3">Payment</h2>
          <p className="text-sm text-slate-600">
            {order.payments[0]?.provider === "cod" ? "Cash on Delivery" : "Online Payment"}
            {" · "}
            {order.payments[0]?.status.replace(/_/g, " ")}
          </p>
        </div>
      </div>
    </div>
  );
}
