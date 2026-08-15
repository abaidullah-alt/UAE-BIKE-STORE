import Link from "next/link";
import { listAdminProducts } from "@/server/services/admin-product.service";
import { formatAED } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductRowActions } from "./product-row-actions";

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  DRAFT: "bg-slate-100 text-slate-600",
  ARCHIVED: "bg-red-100 text-red-700",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { items, total } = await listAdminProducts({ search: q, page: page ? Number(page) : 1 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or SKU..."
          className="h-10 w-full max-w-sm rounded-md border border-slate-300 px-3 text-sm"
        />
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-slate-100 shrink-0" />
                    <span className="font-medium text-slate-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{product.sku}</td>
                <td className="px-4 py-3 text-slate-500">{product.category.name}</td>
                <td className="px-4 py-3 text-slate-800">{formatAED(product.price.toString())}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <ProductRowActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No products found.</p>
        )}
      </div>
    </div>
  );
}
