import { prisma } from "@/lib/db/prisma";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { createBrand, deleteBrand } from "@/server/actions/admin-taxonomy";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Brands</h1>
      <TaxonomyManager
        items={brands.map((b) => ({ id: b.id, name: b.name, slug: b.slug, count: b._count.products }))}
        createAction={createBrand}
        deleteAction={deleteBrand}
        itemLabel="Brand"
      />
    </div>
  );
}
