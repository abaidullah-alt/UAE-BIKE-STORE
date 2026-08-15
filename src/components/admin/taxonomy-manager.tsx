"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { slugify } from "@/lib/text";

interface Item {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Props {
  items: Item[];
  itemLabel: string;
  createAction: (data: { name: string; slug: string }) => Promise<{ success: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function TaxonomyManager({ items, itemLabel, createAction, deleteAction }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createAction({ name: name.trim(), slug: slugify(name) });
      if (!result.success) {
        setError(result.error ?? "Could not create");
        return;
      }
      setName("");
    });
  }

  function handleDelete(id: string) {
    if (!confirm(`Delete this ${itemLabel.toLowerCase()}?`)) return;
    startTransition(async () => {
      const result = await deleteAction(id);
      if (!result.success) setError(result.error ?? "Could not delete");
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-md">
        <Input placeholder={`New ${itemLabel.toLowerCase()} name`} value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" disabled={isPending}>Add</Button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item.slug}</td>
                <td className="px-4 py-3 text-slate-500">{item.count}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(item.id)} disabled={isPending} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-sm text-slate-400 py-8">None yet.</p>}
      </div>
    </div>
  );
}
