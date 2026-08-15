import { prisma } from "@/lib/db/prisma";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { createCategory, deleteCategory } from "@/server/actions/admin-taxonomy";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>
      <TaxonomyManager
        items={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products }))}
        createAction={createCategory}
        deleteAction={deleteCategory}
        itemLabel="Category"
      />
    </div>
  );
}
