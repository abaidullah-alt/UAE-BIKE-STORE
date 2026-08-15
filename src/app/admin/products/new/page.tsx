import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { getSetting } from "@/server/services/settings.service";

export default async function NewProductPage() {
  const [categories, brands, defaultTaxRate] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    getSetting("defaultTaxRate"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Product</h1>
      <ProductForm categories={categories} brands={brands} defaultValues={{ taxRate: Number(defaultTaxRate) }} />
    </div>
  );
}
