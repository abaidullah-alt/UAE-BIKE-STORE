import { FaqAccordion } from "./faq-accordion";
import { listFaqs } from "@/server/services/faq.service";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about ordering, delivery, returns, and bike sizing at UAE Bicycle.",
};

const defaultFaqs = [
  {
    question: "Which areas in the UAE do you deliver to?",
    answer: "We deliver across all seven Emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah. Delivery time is typically 2-4 business days depending on your location.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes — Cash on Delivery is available on all orders.",
  },
  {
    question: "How do I know what bike size I need?",
    answer: "Every bike product page has a 'Find Your Bike Size' tool — enter your height and we'll recommend a frame size. For a precise fit, feel free to contact us before ordering.",
  },
  {
    question: "Can I return a bike if it doesn't fit?",
    answer: "Yes, unused items in original condition can be returned within 14 days of delivery. See our Return & Refund Policy for full details.",
  },
];

export default async function FaqPage() {
  const dbFaqs = await listFaqs(true);
  const faqs = dbFaqs.length > 0
    ? dbFaqs.map((f) => ({ question: f.question, answer: f.answer }))
    : defaultFaqs;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">Frequently Asked Questions</h1>
      <p className="text-slate-500 text-center mb-10">
        Can't find what you're looking for? <a href="/contact" className="text-orange-600 hover:underline">Contact us</a>.
      </p>
      <FaqAccordion faqs={faqs} />
    </div>
  );
}
