import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getProducts } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cycleuae.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? undefined,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, total } = await getProducts({
    categorySlug: slug,
    page: page ? Number(page) : 1,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/categories/${category.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
      {category.description && (
        <p className="text-slate-500 mt-2 max-w-2xl">{category.description}</p>
      )}
      <p className="text-slate-400 text-sm mt-1">{total} product{total === 1 ? "" : "s"}</p>

      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="text-sm font-medium px-4 py-2 rounded-full border border-slate-300 hover:border-orange-500 hover:text-orange-600"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No products in this category yet — check back soon.
        </div>
      )}
    </div>
  );
}
