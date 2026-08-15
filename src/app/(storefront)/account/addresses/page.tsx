import { requireCustomerSession } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";
import { emirateLabels } from "@/lib/validation/checkout";
import { AddressForm } from "./address-form";
import { AddressActions } from "./address-actions";

export default async function AddressesPage() {
  const session = await requireCustomerSession();
  const userId = (session.user as { id: string }).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Addresses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {addresses.map((address) => (
          <div key={address.id} className="border border-slate-200 rounded-lg p-4 relative">
            {address.isDefault && (
              <span className="absolute top-3 right-3 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                DEFAULT
              </span>
            )}
            {address.label && <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{address.label}</p>}
            <p className="font-medium text-slate-900 text-sm">{address.fullName}</p>
            <p className="text-sm text-slate-600 mt-1">
              {address.street}, {address.buildingVilla}
              {address.apartment ? `, ${address.apartment}` : ""}<br />
              {address.area}, {emirateLabels[address.emirate]}<br />
              {address.phone}
            </p>
            <AddressActions addressId={address.id} isDefault={address.isDefault} />
          </div>
        ))}

        {addresses.length === 0 && (
          <p className="text-sm text-slate-500 sm:col-span-2">No saved addresses yet.</p>
        )}
      </div>

      <div className="border border-slate-200 rounded-lg p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add New Address</h2>
        <AddressForm />
      </div>
    </div>
  );
}
