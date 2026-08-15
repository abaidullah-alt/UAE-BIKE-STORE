import { prisma } from "@/lib/db/prisma";
import type { Prisma, ProductStatus } from "@prisma/client";

export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number;
  taxRate: number;
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  images: { url: string; altText?: string }[];
  attributes: { key: string; label: string; value: string; unit?: string }[];
  initialStock?: number;
}

export async function listAdminProducts(params: { search?: string; page?: number; pageSize?: number }) {
  const { search, page = 1, pageSize = 20 } = params;

  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      attributeValues: { include: { attribute: true } },
      variants: { include: { inventory: true } },
    },
  });
}

export async function createProduct(data: ProductFormData) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId || undefined,
        shortDescription: data.shortDescription,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        taxRate: data.taxRate,
        status: data.status,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: data.tags,
        images: {
          create: data.images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i })),
        },
      },
    });

    for (const attr of data.attributes) {
      if (!attr.key || !attr.value) continue;
      const attribute = await tx.productAttribute.upsert({
        where: { key: attr.key },
        update: {},
        create: { key: attr.key, label: attr.label || attr.key, unit: attr.unit },
      });
      await tx.productAttributeValue.create({
        data: { productId: product.id, attributeId: attribute.id, value: attr.value },
      });
    }

    const variant = await tx.productVariant.create({
      data: {
        productId: product.id,
        sku: `${data.sku}-DEFAULT`,
        optionLabel: "Standard",
        isDefault: true,
      },
    });

    await tx.inventory.create({
      data: { variantId: variant.id, quantityOnHand: data.initialStock ?? 0 },
    });

    return product;
  });
}

export async function updateProduct(id: string, data: ProductFormData) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        shortDescription: data.shortDescription,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        taxRate: data.taxRate,
        status: data.status,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        tags: data.tags,
      },
    });

    // Replace images wholesale — simplest correct approach for admin edits
    await tx.productImage.deleteMany({ where: { productId: id } });
    if (data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((img, i) => ({
          productId: id,
          url: img.url,
          altText: img.altText,
          sortOrder: i,
        })),
      });
    }

    // Replace attribute values wholesale
    await tx.productAttributeValue.deleteMany({ where: { productId: id } });
    for (const attr of data.attributes) {
      if (!attr.key || !attr.value) continue;
      const attribute = await tx.productAttribute.upsert({
        where: { key: attr.key },
        update: {},
        create: { key: attr.key, label: attr.label || attr.key, unit: attr.unit },
      });
      await tx.productAttributeValue.create({
        data: { productId: id, attributeId: attribute.id, value: attr.value },
      });
    }
  });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

export async function setProductStatus(id: string, status: ProductStatus) {
  await prisma.product.update({ where: { id }, data: { status } });
}
