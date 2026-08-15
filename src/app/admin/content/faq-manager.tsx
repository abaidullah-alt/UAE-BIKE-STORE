"use client";

import { useState, useTransition } from "react";
import { createFaqAction, deleteFaqAction, toggleFaqAction } from "@/server/actions/faq";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
}

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createFaqAction({ question, answer });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQuestion("");
      setAnswer("");
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 max-w-2xl space-y-3">
        <h2 className="font-semibold text-slate-900">Add FAQ</h2>
        <Input placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isPending}>Add FAQ</Button>
      </form>

      <div className="space-y-3 max-w-2xl">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium text-slate-900">{faq.question}</p>
                <p className="text-sm text-slate-500 mt-1">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => { toggleFaqAction(faq.id, !faq.isPublished); })}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    faq.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {faq.isPublished ? "Published" : "Hidden"}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Delete this FAQ?")) startTransition(() => { deleteFaqAction(faq.id); });
                  }}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-slate-400">No FAQs yet — add your first one above.</p>}
      </div>
    </div>
  );
}
