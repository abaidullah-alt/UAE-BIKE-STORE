"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {faqs.map((faq, i) => (
        <div key={faq.question}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="font-medium text-slate-900">{faq.question}</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ms-4 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          {openIndex === i && (
            <p className="text-sm text-slate-600 pb-4 pr-8">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
