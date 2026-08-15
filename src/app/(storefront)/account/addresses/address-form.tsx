"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAddress } from "@/server/actions/address";
import { emirates, emirateLabels } from "@/lib/validation/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, "Enter a name"),
  phone: z.string().regex(/^(?:\+971|0)5\d{8}$/, "Enter a valid UAE mobile number"),
  emirate: z.enum(emirates, { message: "Select an Emirate" }),
  area: z.string().min(2, "Enter an area"),
  street: z.string().min(2, "Enter a street"),
  buildingVilla: z.string().min(1, "Enter a building/villa"),
  apartment: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddressForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    setSuccess(false);
    const result = await createAddress(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSuccess(true);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="label">Label (optional)</Label>
          <Input id="label" placeholder="Home, Office..." {...register("label")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" placeholder="05XXXXXXXX" {...register("phone")} />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emirate">Emirate</Label>
          <select id="emirate" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm" {...register("emirate")} defaultValue="">
            <option value="" disabled>Select Emirate</option>
            {emirates.map((e) => (
              <option key={e} value={e}>{emirateLabels[e]}</option>
            ))}
          </select>
          {errors.emirate && <p className="text-xs text-red-600">{errors.emirate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="area">Area</Label>
          <Input id="area" {...register("area")} />
          {errors.area && <p className="text-xs text-red-600">{errors.area.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="street">Street</Label>
          <Input id="street" {...register("street")} />
          {errors.street && <p className="text-xs text-red-600">{errors.street.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="buildingVilla">Building / Villa</Label>
          <Input id="buildingVilla" {...register("buildingVilla")} />
          {errors.buildingVilla && <p className="text-xs text-red-600">{errors.buildingVilla.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apartment">Apartment (optional)</Label>
          <Input id="apartment" {...register("apartment")} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register("isDefault")} className="h-4 w-4 accent-orange-600" />
        Set as default address
      </label>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {success && <p className="text-sm text-green-600">Address saved.</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Address"}
      </Button>
    </form>
  );
}
