import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductGallery } from "./product-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";
import { BikeSizeGuide } from "./bike-size-guide";
import { ProductViewTracker } from "@/components/storefront/product-view-tracker";
import { Star } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cycleuae.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

// Categories where the size guide is relevant
// The size guide shows an ADULT height-to-frame-size chart (150-210cm) —
// only appropriate for road/mountain bikes with adjustable adult frame
// sizing. Deliberately NOT matched by generic "contains the word bike"
// logic, which incorrectly showed this on Kids Bikes, City Bikes, and
// E-Bikes/hoverboards where an adult sizing chart is meaningless or
// actively confusing.
const ADULT_SIZE_GUIDE_CATEGORIES = ["mountain-bikes", "road-bikes"];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);

  const showAdultSizeGuide = ADULT_SIZE_GUIDE_CATEGORIES.includes(product.category.slug.toLowerCase());

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  // JSON-LD structured data for SEO
  const totalAvailable = product.variants.reduce(
    (sum, v) => sum + Math.max((v.inventory?.quantityOnHand ?? 0) - (v.inventory?.quantityReserved ?? 0), 0),
    0
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    description: product.shortDescription ?? undefined,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "AED",
      price: (product.salePrice ?? product.price).toString(),
      availability: totalAvailable > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
    ...(avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 2, name: product.category.name, item: `${SITE_URL}/categories/${product.category.slug}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductViewTracker
        productId={product.id}
        productName={product.name}
        price={Number(product.salePrice ?? product.price)}
      />

      <nav className="text-sm text-slate-500 mb-6">
        <a href="/shop" className="hover:text-orange-600">Shop</a>
        <span className="mx-2">/</span>
        <a href={`/categories/${product.category.slug}`} className="hover:text-orange-600">
          {product.category.name}
        </a>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand && (
            <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">
              {product.brand.name}
            </p>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mt-1">{product.name}</h1>

          {avgRating !== null && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(avgRating) ? "fill-orange-400 text-orange-400" : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">
                {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          )}

          {product.shortDescription && (
            <p className="text-slate-600 mt-4">{product.shortDescription}</p>
          )}

          <ProductPurchasePanel product={product} />

          {showAdultSizeGuide && <BikeSizeGuide />}

          {product.attributeValues.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-slate-900 mb-3">Specifications</h2>
              <dl className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {product.attributeValues.map((av) => (
                  <div key={av.id} className="flex justify-between px-4 py-2.5 text-sm odd:bg-slate-50">
                    <dt className="text-slate-500">{av.attribute.label}</dt>
                    <dd className="text-slate-900 font-medium">
                      {av.value}
                      {av.attribute.unit ? ` ${av.attribute.unit}` : ""}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-14 max-w-3xl">
          <h2 className="font-semibold text-slate-900 mb-3 text-xl">Description</h2>
          <div className="prose prose-slate text-slate-600 whitespace-pre-line">
            {product.description}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
