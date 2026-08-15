import { getProducts } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";

export const metadata = {
  title: "Special Offers",
  description: "Current deals and discounted bikes and cycling gear at UAE Bicycle.",
};

export default async function OffersPage() {
  const { items, total } = await getProducts({ onSale: true, pageSize: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Special Offers</h1>
        <p className="text-slate-500 mt-2">
          {total > 0 ? `${total} product${total === 1 ? "" : "s"} on sale right now` : "No active offers right now — check back soon."}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          No products are currently discounted. Set a sale price on a product in the admin dashboard to feature it here.
        </div>
      )}
    </div>
  );
}
