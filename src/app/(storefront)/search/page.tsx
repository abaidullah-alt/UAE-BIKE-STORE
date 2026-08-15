import type { Metadata } from "next";
import { getProducts } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";

export const metadata: Metadata = {
  title: "Search Results",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";

  const { items, total } = query
    ? await getProducts({ search: query, page: page ? Number(page) : 1 })
    : { items: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      <p className="text-slate-500 mt-1">
        {query ? `${total} product${total === 1 ? "" : "s"} found` : "Enter a search term above to find bikes and gear."}
      </p>

      {query && items.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No products matched &ldquo;{query}&rdquo;. Try a different term, or browse our{" "}
          <a href="/shop" className="text-orange-600 hover:underline">
            full catalog
          </a>
          .
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
