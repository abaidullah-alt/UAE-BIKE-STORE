export const metadata = { title: "Return & Refund Policy" };

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 not-prose">Return & Refund Policy</h1>

      <h2>Return Window</h2>
      <p>You may return most items within 14 days of delivery, provided they are unused, in original condition, and in original packaging.</p>

      <h2>How to Start a Return</h2>
      <p>Go to My Orders in your account, select the relevant order, and choose "Request Return." Our team will review and confirm next steps, including pickup arrangements.</p>

      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Items that show signs of use or installation (e.g. a bike that has been ridden)</li>
        <li>Personal-fit items without original packaging (e.g. worn cycling shoes)</li>
        <li>Items marked as final sale at time of purchase</li>
      </ul>

      <h2>Refunds</h2>
      <p>Once a returned item is received and inspected, refunds are processed to your original payment method (or arranged directly for Cash on Delivery orders). Please allow 5–10 business days for the refund to reflect, depending on your bank.</p>

      <h2>Exchanges</h2>
      <p>If your bike doesn't fit, we're happy to help you exchange it for a different size — contact us before returning to arrange this smoothly.</p>

      <h2>Damaged or Incorrect Items</h2>
      <p>If your order arrives damaged or incorrect, contact us within 48 hours of delivery with photos, and we'll arrange a replacement or refund at no extra cost to you.</p>
    </div>
  );
}
