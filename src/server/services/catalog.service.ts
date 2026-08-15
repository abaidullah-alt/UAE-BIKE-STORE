import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type ProductListItem = Awaited<ReturnType<typeof getProducts>>["items"][number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

const productListInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  brand: true,
  category: true,
  variants: { where: { isDefault: true }, take: 1 },
} satisfies Prisma.ProductInclude;

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onSale?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    search,
    onSale,
    sort = "featured",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brandSlug && { brand: { slug: brandSlug } }),
    ...(onSale && { salePrice: { not: null } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "newest"
      ? { createdAt: "desc" }
      : sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : { isFeatured: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: productListInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: productListInclude,
    take,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      brand: true,
      category: true,
      variants: { include: { inventory: true } },
      attributeValues: { include: { attribute: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, take = 4) {
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categoryId,
      id: { not: productId },
    },
    include: productListInclude,
    take,
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
}

export async function getBrands() {
  return prisma.brand.findMany({ orderBy: { name: "asc" } });
}
