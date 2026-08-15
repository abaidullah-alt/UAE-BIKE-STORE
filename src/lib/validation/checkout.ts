import { z } from "zod";

const uaePhoneRegex = /^(?:\+971|0)5\d{8}$/;

export const emirates = [
  "ABU_DHABI",
  "DUBAI",
  "SHARJAH",
  "AJMAN",
  "UMM_AL_QUWAIN",
  "RAS_AL_KHAIMAH",
  "FUJAIRAH",
] as const;

export const emirateLabels: Record<(typeof emirates)[number], string> = {
  ABU_DHABI: "Abu Dhabi",
  DUBAI: "Dubai",
  SHARJAH: "Sharjah",
  AJMAN: "Ajman",
  UMM_AL_QUWAIN: "Umm Al Quwain",
  RAS_AL_KHAIMAH: "Ras Al Khaimah",
  FUJAIRAH: "Fujairah",
};

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(uaePhoneRegex, "Enter a valid UAE mobile number, e.g. 05XXXXXXXX"),
  emirate: z.enum(emirates, { message: "Select your Emirate" }),
  area: z.string().min(2, "Enter your area"),
  street: z.string().min(2, "Enter your street"),
  buildingVilla: z.string().min(1, "Enter your building or villa"),
  apartment: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  // Cash on Delivery only — this store doesn't accept online payment.
  paymentMethod: z.literal("cod").default("cod"),
  couponCode: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
