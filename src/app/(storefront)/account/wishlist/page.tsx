import Link from "next/link";
import Image from "next/image";
import { requireCustomerSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { formatAED } from "@/lib/utils";
import { RemoveWishlistButton } from "./remove-wishlist-button";

export default async function WishlistPage() {
  const session = await requireCustomerSession();
  const userId = (session.user as { id: string }).id;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  const items = wishlist?.items ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nothing saved yet — browse the <Link href="/shop" className="text-orange-600 hover:underline">shop</Link> and tap the heart icon on any product.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <Link href={`/products/${item.product.slug}`} className="block aspect-square bg-slate-100 relative">
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                )}
              </Link>
              <div className="p-3">
                <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-slate-800 hover:text-orange-600 line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-orange-600 font-semibold text-sm mt-1">{formatAED(item.product.price.toString())}</p>
                <RemoveWishlistButton wishlistItemId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
