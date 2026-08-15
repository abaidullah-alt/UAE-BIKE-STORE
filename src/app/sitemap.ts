import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cycleuae.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/offers`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/guides/size-guide`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/policies/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policies/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policies/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policies/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Product/category pages are fetched from the database, but a database
  // hiccup at build time (e.g. right after connecting a new Neon database
  // on Vercel, before it's fully warm) should never fail the entire site
  // build — sitemap.xml just falls back to the static pages above, and
  // will pick up products again on the next build/revalidation.
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
      }),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("sitemap.ts: could not reach database, returning static pages only", error);
    return staticPages;
  }
}
