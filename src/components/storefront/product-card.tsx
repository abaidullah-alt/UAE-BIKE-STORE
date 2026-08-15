import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatAED } from "@/lib/utils";
import type { ProductListItem } from "@/server/services/catalog.service";

export function ProductCard({ product }: { product: ProductListItem }) {
  const image = product.images[0];
  const variant = product.variants[0];
  const displayPrice = variant?.priceOverride ?? product.price;
  const onSale = product.salePrice !== null && product.salePrice !== undefined;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 h-full">
        <div className="aspect-square bg-slate-100 relative flex items-center justify-center text-slate-400 text-sm overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            "No image"
          )}
          {onSale && (
            <span className="absolute top-2 start-2 rounded-full bg-orange-600 text-white text-[10px] font-bold px-2 py-1 animate-float">
              SALE
            </span>
          )}
        </div>
        <CardContent className="pt-4">
          {product.brand && (
            <p className="text-xs text-slate-500 uppercase tracking-wide">{product.brand.name}</p>
          )}
          <p className="font-semibold text-slate-900 mt-1 line-clamp-2">{product.name}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {onSale ? (
              <>
                <span className="text-orange-600 font-bold">{formatAED(product.salePrice!.toString())}</span>
                <span className="text-slate-400 text-sm line-through">{formatAED(displayPrice.toString())}</span>
              </>
            ) : (
              <span className="text-orange-600 font-bold">{formatAED(displayPrice.toString())}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
