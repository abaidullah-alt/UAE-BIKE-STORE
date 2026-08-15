import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth.config";
import { getOrderById } from "@/server/services/order.service";
import { formatAED } from "@/lib/utils";
import { emirateLabels } from "@/lib/validation/checkout";
import { PrintButton } from "./print-button";

// Deliberately outside the (storefront) route group — no header/footer/nav,
// just a clean printable document.
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  // Allow guest orders (no account) to view their own invoice via the
  // order-confirmation flow; for logged-in customers, verify ownership.
  if (order.userId) {
    const session = await auth();
    const currentUserId = session?.user ? (session.user as { id: string }).id : null;
    if (currentUserId !== order.userId) notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-10 print:p-0 font-sans">
      <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            UAE<span className="text-orange-600"> BICYCLE</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tax Invoice</p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
          <p>{new Date(order.createdAt).toLocaleDateString("en-AE", { dateStyle: "long" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p className="font-semibold text-slate-900 mb-1">Bill To</p>
          <p className="text-slate-600">
            {order.shippingFullName}<br />
            {order.shippingStreet}, {order.shippingBuilding}
            {order.shippingApartment ? `, ${order.shippingApartment}` : ""}<br />
            {order.shippingArea}, {emirateLabels[order.shippingEmirate]}<br />
            {order.shippingPhone}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-1">Payment Method</p>
          <p className="text-slate-600">
            {order.payments[0]?.provider === "cod" ? "Cash on Delivery" : "Online Payment"}
          </p>
        </div>
      </div>

      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="border-b-2 border-slate-300 text-left text-slate-500">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Unit Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-3 text-slate-800">{item.productName}</td>
              <td className="py-3 text-center text-slate-600">{item.quantity}</td>
              <td className="py-3 text-right text-slate-600">{formatAED(item.unitPrice.toString())}</td>
              <td className="py-3 text-right text-slate-800 font-medium">{formatAED(item.lineTotal.toString())}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatAED(order.subtotal.toString())}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VAT</span>
            <span>{formatAED(order.taxTotal.toString())}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{Number(order.shippingTotal) === 0 ? "Free" : formatAED(order.shippingTotal.toString())}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-2">
            <span>Total</span>
            <span>{formatAED(order.grandTotal.toString())}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-12 text-center">
        Thank you for shopping with UAE Bicycle. This is a system-generated invoice.
      </p>

      <PrintButton />
    </div>
  );
}
