export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 not-prose">Terms & Conditions</h1>
      <p className="text-sm text-slate-400 not-prose mb-6">Last updated: {new Date().toLocaleDateString("en-AE", { dateStyle: "long" })}</p>

      <p><em>This is a starter template. Before launch, have this reviewed by a UAE-qualified lawyer against your actual business setup (trade license, terms of sale, consumer protection obligations) — this text is a reasonable starting structure, not legal advice.</em></p>

      <h2>1. About These Terms</h2>
      <p>These Terms & Conditions govern your use of the UAE Bicycle website and any purchases made through it. By placing an order, you agree to these terms.</p>

      <h2>2. Products and Pricing</h2>
      <p>All prices are listed in AED and include applicable VAT unless stated otherwise. We reserve the right to correct pricing errors and to update product availability without notice.</p>

      <h2>3. Orders</h2>
      <p>Placing an order is an offer to purchase; a contract is formed once we confirm your order. We may decline or cancel an order in cases of pricing errors, stock unavailability, or suspected fraud.</p>

      <h2>4. Payment</h2>
      <p>We accept Cash on Delivery and online payment. Online payments are processed by a third-party payment provider under their own terms.</p>

      <h2>5. Delivery</h2>
      <p>Delivery timeframes are estimates, not guarantees. See our <a href="/policies/shipping">Shipping Policy</a> for details.</p>

      <h2>6. Returns</h2>
      <p>See our <a href="/policies/returns">Return & Refund Policy</a> for return eligibility and process.</p>

      <h2>7. Warranty</h2>
      <p>Products are covered by their manufacturer's warranty where applicable. Contact us for warranty claim assistance.</p>

      <h2>8. Limitation of Liability</h2>
      <p>To the extent permitted by UAE law, UAE Bicycle is not liable for indirect or consequential losses arising from use of our products or website.</p>

      <h2>9. Governing Law</h2>
      <p>These terms are governed by the laws of the United Arab Emirates.</p>

      <h2>10. Contact</h2>
      <p>Questions about these terms? Reach out through our <a href="/contact">Contact page</a>.</p>
    </div>
  );
}
