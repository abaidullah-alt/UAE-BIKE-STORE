"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteProductAction } from "@/server/actions/admin-product";
import { Pencil, Trash2 } from "lucide-react";

export function ProductRowActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Delete this product permanently? This cannot be undone.")) {
      startTransition(() => { deleteProductAction(productId); });
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/admin/products/${productId}/edit`} className="text-slate-500 hover:text-orange-600" aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <button onClick={handleDelete} disabled={isPending} className="text-slate-500 hover:text-red-600" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
