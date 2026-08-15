"use client";

import { useTransition } from "react";
import { removeFromWishlist } from "@/server/actions/wishlist";

export function RemoveWishlistButton({ wishlistItemId }: { wishlistItemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => { removeFromWishlist(wishlistItemId); })}
      className="text-xs text-red-600 hover:underline mt-2"
    >
      Remove
    </button>
  );
}
