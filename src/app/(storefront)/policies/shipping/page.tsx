export const metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 not-prose">Shipping Policy</h1>

      <h2>Delivery Coverage</h2>
      <p>We deliver across all seven Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.</p>

      <h2>Delivery Times</h2>
      <ul>
        <li><strong>Dubai, Sharjah, Ajman:</strong> 2–3 business days (Standard), next-day available (Express)</li>
        <li><strong>Other Emirates:</strong> 3–5 business days</li>
      </ul>
      <p>Delivery estimates are business days and exclude public holidays. Large items (bikes) may require an additional 1-2 days for careful packaging.</p>

      <h2>Shipping Fees</h2>
      <p>Shipping is calculated at checkout based on your Emirate and order value. Orders over AED 500 qualify for free standard shipping.</p>

      <h2>Order Tracking</h2>
      <p>Once your order ships, you'll be able to track its status from your account under My Orders. A tracking number is added once your courier collects the package.</p>

      <h2>Delivery Attempts</h2>
      <p>Our courier will attempt delivery to the address provided at checkout. If unavailable, a re-delivery will be attempted; please ensure your phone number is correct so the courier can reach you.</p>

      <h2>Questions?</h2>
      <p>Contact us at any time via our <a href="/contact">Contact page</a> for shipping questions specific to your order.</p>
    </div>
  );
}
