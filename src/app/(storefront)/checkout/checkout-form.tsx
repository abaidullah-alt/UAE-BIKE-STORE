"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput, emirates, emirateLabels } from "@/lib/validation/checkout";
import { submitCheckout } from "@/server/actions/checkout";
import { trackEvent } from "@/lib/analytics/track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckoutForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("CHECKOUT_STARTED");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutInput>,
    defaultValues: { paymentMethod: "cod" },
  });

  const onSubmit = async (data: CheckoutInput) => {
    setServerError(null);
    const result = await submitCheckout(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    trackEvent("PURCHASE", { orderId: result.orderId, orderNumber: result.orderNumber });
    router.push(`/order-confirmation/${result.orderId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" type="tel" placeholder="05XXXXXXXX" {...register("phone")} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Delivery Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="emirate">Emirate</Label>
            <select
              id="emirate"
              className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm"
              {...register("emirate")}
              defaultValue=""
            >
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="deliveryInstructions">Delivery instructions (optional)</Label>
            <Input id="deliveryInstructions" {...register("deliveryInstructions")} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Coupon Code (optional)</h2>
        <Input placeholder="e.g. RIDE10" {...register("couponCode")} />
        <p className="text-xs text-slate-400 mt-1.5">Applied and verified when you place your order.</p>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Payment Method</h2>
        <input type="hidden" value="cod" {...register("paymentMethod")} />
        <div className="flex items-center gap-3 border border-orange-600 bg-orange-50 rounded-lg p-4">
          <div className="h-5 w-5 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
            <span className="h-2 w-2 rounded-full bg-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">Cash on Delivery</p>
            <p className="text-xs text-slate-500">Pay in cash when your order arrives at your door</p>
          </div>
        </div>
        {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod.message}</p>}
      </section>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Placing order..." : "Place Order"}
      </Button>
    </form>
  );
}
