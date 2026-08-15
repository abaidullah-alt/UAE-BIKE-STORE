export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 not-prose">Privacy Policy</h1>
      <p className="text-sm text-slate-400 not-prose mb-6">Last updated: {new Date().toLocaleDateString("en-AE", { dateStyle: "long" })}</p>

      <p><em>This is a starter template. Before launch, have this reviewed against UAE data protection law (Federal Decree-Law No. 45 of 2021 on Personal Data Protection) and your actual data practices — this text is a reasonable starting structure, not legal advice.</em></p>

      <h2>Information We Collect</h2>
      <p>When you use UAE Bicycle, we may collect: your name, email, phone number, delivery addresses, order history, and browsing behavior on our site (see our approach to analytics below).</p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To communicate with you about your orders, account, or support requests</li>
        <li>To improve our website and product range based on browsing and purchase patterns</li>
        <li>To send marketing communications, only if you've opted in</li>
      </ul>

      <h2>Payment Information</h2>
      <p>We never store your full card details on our servers. Online payments are processed by our payment provider directly.</p>

      <h2>Data Sharing</h2>
      <p>We share your delivery details with our courier partners solely to fulfil your order. We do not sell your personal data to third parties.</p>

      <h2>Analytics</h2>
      <p>We collect anonymous usage data (pages viewed, products viewed, cart activity) to understand how customers use our site and improve it. This is not linked to your identity unless you're logged into an account.</p>

      <h2>Your Rights</h2>
      <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us via our <a href="/contact">Contact page</a>.</p>

      <h2>Cookies</h2>
      <p>We use essential cookies (for cart and login sessions) and a language-preference cookie. We do not use third-party advertising cookies.</p>

      <h2>Contact</h2>
      <p>Questions about this policy? Reach out through our <a href="/contact">Contact page</a>.</p>
    </div>
  );
}
