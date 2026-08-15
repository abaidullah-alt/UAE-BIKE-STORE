import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getAdminProductById } from "@/server/services/admin-product.service";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(id),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Product</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          brandId: product.brandId ?? undefined,
          shortDescription: product.shortDescription ?? undefined,
          description: product.description ?? undefined,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          taxRate: Number(product.taxRate),
          status: product.status,
          isFeatured: product.isFeatured,
          seoTitle: product.seoTitle ?? undefined,
          seoDescription: product.seoDescription ?? undefined,
          tagsInput: product.tags.join(", "),
          images: product.images.map((img) => ({ url: img.url, altText: img.altText ?? undefined })),
          attributes: product.attributeValues.map((av) => ({
            key: av.attribute.key,
            label: av.attribute.label,
            value: av.value,
            unit: av.attribute.unit ?? undefined,
          })),
        }}
      />
    </div>
  );
}
