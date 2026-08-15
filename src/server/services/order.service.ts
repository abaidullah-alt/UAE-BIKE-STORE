import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth.config";
import { getOrCreateCart, calculateCartTotals } from "./cart.service";
import { getEffectivePrice } from "@/lib/pricing";
import { getPaymentProvider } from "@/lib/payments/payment.service";
import { getShippingProvider } from "@/lib/shipping/shipping.service";
import { validateCoupon } from "./admin-coupon.service";
import type { CheckoutInput } from "@/lib/validation/checkout";

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `UAE-CYC-${timestamp}${random}`;
}

export async function placeOrder(input: CheckoutInput) {
  const cart = await getOrCreateCart();
  const activeItems = cart.items.filter((i) => !i.savedForLater);

  if (activeItems.length === 0) {
    throw new Error("Your cart is empty");
  }

  // Re-validate stock at the moment of order — prevents overselling if
  // stock changed since the item was added to cart.
  for (const item of activeItems) {
    const available =
      (item.variant.inventory?.quantityOnHand ?? 0) - (item.variant.inventory?.quantityReserved ?? 0);
    if (item.quantity > available) {
      throw new Error(`Only ${available} of "${item.variant.product.name}" left in stock`);
    }
  }

  const { subtotal, taxTotal } = calculateCartTotals(cart);
  const shippingProvider = getShippingProvider("manual");
  const [rate] = await shippingProvider.getRates(input.emirate, subtotal);
  let shippingTotal = rate?.price ?? 0;

  let discountTotal = 0;
  let appliedCouponId: string | null = null;

  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, subtotal);
    if ("error" in result) {
      throw new Error(result.error);
    }
    if (result.coupon) {
      appliedCouponId = result.coupon.id;
      if (result.coupon.type === "FREE_SHIPPING") {
        shippingTotal = 0;
      } else {
        discountTotal = result.discount;
      }
    }
  }

  const grandTotal = subtotal + taxTotal + shippingTotal - discountTotal;

  const session = await auth();
  const userId = session?.user ? (session.user as { id: string }).id : undefined;

  // Cash on Delivery only — the payment abstraction layer (src/lib/payments/)
  // is still ready for a real gateway later; swap this line for the real
  // provider name once one is chosen and this store wants online payment.
  const provider = getPaymentProvider("cod");

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        guestEmail: userId ? undefined : input.email,
        guestPhone: userId ? undefined : input.phone,
        status: "PENDING",
        shippingFullName: input.fullName,
        shippingPhone: input.phone,
        shippingEmirate: input.emirate,
        shippingArea: input.area,
        shippingStreet: input.street,
        shippingBuilding: input.buildingVilla,
        shippingApartment: input.apartment,
        shippingInstructions: input.deliveryInstructions,
        subtotal,
        taxTotal,
        shippingTotal,
        discountTotal,
        grandTotal,
        items: {
          create: activeItems.map((item) => {
            const price = getEffectivePrice({ variant: item.variant, product: item.variant.product });
            return {
              variantId: item.variantId,
              productName: item.variant.product.name,
              variantLabel: item.variant.optionLabel,
              unitPrice: price,
              quantity: item.quantity,
              lineTotal: price * item.quantity,
            };
          }),
        },
      },
    });

    // Deduct stock and log the transaction — append-only audit trail
    for (const item of activeItems) {
      if (!item.variant.inventory) continue;
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: { quantityOnHand: { decrement: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: item.variant.inventory.id,
          type: "ORDER_DEDUCTION",
          quantity: -item.quantity,
          orderId: newOrder.id,
          reason: `Order ${newOrder.orderNumber}`,
        },
      });
    }

    const paymentSession = await provider.createPaymentSession({
      orderId: newOrder.id,
      amount: grandTotal,
      currency: "AED",
      customerEmail: input.email,
    });

    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        provider: provider.name,
        providerRef: paymentSession.providerRef,
        amount: grandTotal,
        status: paymentSession.status,
      },
    });

    await tx.order.update({
      where: { id: newOrder.id },
      data: { status: "CONFIRMED" },
    });

    const shipment = await shippingProvider.createShipment({
      orderId: newOrder.id,
      emirate: input.emirate,
    });
    await tx.shipment.create({
      data: {
        orderId: newOrder.id,
        provider: shippingProvider.name,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
      },
    });

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (appliedCouponId) {
      await tx.orderCoupon.create({ data: { orderId: newOrder.id, couponId: appliedCouponId } });
      await tx.coupon.update({ where: { id: appliedCouponId }, data: { usageCount: { increment: 1 } } });
    }

    return newOrder;
  });

  return order;
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
      shipment: true,
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payments: true, shipment: true },
  });
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, shipment: true },
    orderBy: { createdAt: "desc" },
  });
}
