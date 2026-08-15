"use client";

import { useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/server/actions/address";

export function AddressActions({ addressId, isDefault }: { addressId: string; isDefault: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3 mt-3 text-xs">
      {!isDefault && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => { setDefaultAddress(addressId); })}
          className="font-medium text-orange-600 hover:underline"
        >
          Set as default
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Remove this address?")) {
            startTransition(() => { deleteAddress(addressId); });
          }
        }}
        className="font-medium text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
