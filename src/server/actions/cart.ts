"use server";

import { revalidatePath } from "next/cache";
import {
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
} from "@/server/services/cart.service";

export type CartActionResult = { success: true } | { success: false; error: string };

export async function addToCartAction(
  variantId: string,
  quantity: number
): Promise<CartActionResult> {
  try {
    await addItemToCart(variantId, quantity);
    revalidatePath("/cart");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not add to cart" };
  }
}

export async function updateCartItemAction(
  cartItemId: string,
  quantity: number
): Promise<CartActionResult> {
  try {
    await updateCartItemQuantity(cartItemId, quantity);
    revalidatePath("/cart");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not update cart" };
  }
}

export async function removeCartItemAction(cartItemId: string): Promise<CartActionResult> {
  try {
    await removeCartItem(cartItemId);
    revalidatePath("/cart");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not remove item" };
  }
}
