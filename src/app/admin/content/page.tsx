import { listFaqs } from "@/server/services/faq.service";
import { FaqManager } from "./faq-manager";

export default async function AdminContentPage() {
  const faqs = await listFaqs();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Content</h1>
      <p className="text-sm text-slate-500 mb-6">
        Manage the questions shown on your public <a href="/faq" className="text-orange-600 hover:underline">FAQ page</a>.
      </p>

      <FaqManager
        faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, isPublished: f.isPublished }))}
      />

      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500 max-w-2xl">
        <p className="font-medium text-slate-700 mb-1">About/Contact/Policy pages</p>
        <p>
          Those pages (About Us, Shipping Policy, Returns, Privacy, Terms) aren&apos;t editable from here yet — they&apos;re
          currently text written directly in the code. If you want those editable from the dashboard too, that&apos;s a
          reasonable next feature to add.
        </p>
      </div>
    </div>
  );
}
