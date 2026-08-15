"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@prisma/client";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative flex items-center justify-center text-slate-400">
        {active ? (
          <Image
            src={active.url}
            alt={active.altText ?? productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          "No image available"
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 relative ${
                i === activeIndex ? "border-orange-600" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.altText ?? productName} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
