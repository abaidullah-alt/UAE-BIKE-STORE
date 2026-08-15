import { getProducts, getCategories, getBrands } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopFilters } from "./shop-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Bikes & Cycling Gear",
  description: "Browse our full range of bikes, e-bikes, and cycling accessories, delivered across the UAE.",
  alternates: { canonical: "/shop" },
};

type SortOption = "featured" | "newest" | "price_asc" | "price_desc";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const [{ items, total, totalPages, page }, categories, brands] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      brandSlug: params.brand,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      search: params.q,
      sort: (params.sort as SortOption) ?? "featured",
      page: params.page ? Number(params.page) : 1,
    }),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {params.q ? `Results for "${params.q}"` : "Shop All Products"}
        </h1>
        <p className="text-slate-500 mt-1">{total} product{total === 1 ? "" : "s"} found</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <ShopFilters categories={categories} brands={brands} activeParams={params} />

        <div>
          {items.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No products match your filters yet — try adjusting them, or check back soon as we add inventory.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <a
                  key={i}
                  href={`?${new URLSearchParams({ ...params, page: String(i + 1) }).toString()}`}
                  className={`h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium ${
                    page === i + 1
                      ? "bg-orange-600 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
