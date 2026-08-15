"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCouponAction } from "@/server/actions/admin-coupon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  value: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CouponForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { type: "PERCENTAGE" },
  });

  const type = watch("type");

  async function onSubmit(data: FormValues) {
    setError(null);
    setSuccess(false);
    const result = await createCouponAction(data);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="code">Code</Label>
          <Input id="code" placeholder="RIDE10" {...register("code")} />
          {errors.code && <p className="text-xs text-red-600">{errors.code.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select id="type" className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm" {...register("type")}>
            <option value="PERCENTAGE">Percentage Off</option>
            <option value="FIXED_AMOUNT">Fixed Amount Off</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
        </div>
        {type !== "FREE_SHIPPING" && (
          <div className="space-y-1.5">
            <Label htmlFor="value">{type === "PERCENTAGE" ? "Percent (%)" : "Amount (AED)"}</Label>
            <Input id="value" type="number" step="0.01" {...register("value")} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="minOrderValue">Min Order (AED, optional)</Label>
          <Input id="minOrderValue" type="number" step="0.01" {...register("minOrderValue")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
          <Input id="usageLimit" type="number" {...register("usageLimit")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiresAt">Expires (optional)</Label>
          <Input id="expiresAt" type="date" {...register("expiresAt")} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Coupon created.</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Coupon"}
      </Button>
    </form>
  );
}
