"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Brand } from "@prisma/client";

interface Props {
  categories: (Category & { children: Category[] })[];
  brands: Brand[];
  activeParams: Record<string, string | undefined>;
}

export function ShopFilters({ categories, brands, activeParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState(activeParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(activeParams.maxPrice ?? "");

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(
      Object.entries(activeParams).filter(([, v]) => v !== undefined) as [string, string][]
    );
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="space-y-8">
      <div>
        <p className="font-semibold text-slate-900 mb-3">Sort by</p>
        <select
          className="w-full h-10 rounded-md border border-slate-300 text-sm px-3"
          value={activeParams.sort ?? "featured"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div>
        <p className="font-semibold text-slate-900 mb-3">Category</p>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam("category", cat.slug)}
                className={`text-sm hover:text-orange-600 ${
                  activeParams.category === cat.slug ? "text-orange-600 font-semibold" : "text-slate-600"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {brands.length > 0 && (
        <div>
          <p className="font-semibold text-slate-900 mb-3">Brand</p>
          <ul className="space-y-2">
            {brands.map((brand) => (
              <li key={brand.id}>
                <button
                  onClick={() => updateParam("brand", brand.slug)}
                  className={`text-sm hover:text-orange-600 ${
                    activeParams.brand === brand.slug ? "text-orange-600 font-semibold" : "text-slate-600"
                  }`}
                >
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="font-semibold text-slate-900 mb-3">Price (AED)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9"
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3"
          onClick={() => {
            updateParam("minPrice", minPrice || undefined);
            updateParam("maxPrice", maxPrice || undefined);
          }}
        >
          Apply
        </Button>
      </div>

      {(activeParams.category || activeParams.brand || activeParams.minPrice) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-slate-500 hover:text-orange-600 underline"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
