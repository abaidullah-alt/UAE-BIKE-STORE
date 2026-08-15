"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics/track";

interface Suggestion {
  products: { id: string; name: string; slug: string; price: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export function SearchBox({ placeholder = "Search bikes, helmets, accessories..." }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setSuggestions(await res.json());
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    trackEvent("SEARCH", { query });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const hasResults =
    suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0);

  return (
    <div ref={containerRef} className="hidden md:block flex-1 max-w-xl relative">
      <form onSubmit={handleSubmit}>
        <div className="relative w-full">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={placeholder}
            className="ps-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
          />
        </div>
      </form>

      {open && hasResults && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
          {suggestions!.categories.length > 0 && (
            <div className="p-2 border-b border-slate-100">
              {suggestions!.categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="block px-3 py-2 text-sm rounded-md hover:bg-slate-50 text-slate-700"
                >
                  📁 {cat.name}
                </a>
              ))}
            </div>
          )}
          <div className="p-2">
            {suggestions!.products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex justify-between px-3 py-2 text-sm rounded-md hover:bg-slate-50"
              >
                <span className="text-slate-800">{product.name}</span>
                <span className="text-slate-400">AED {product.price}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
