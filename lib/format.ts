// Currency + locale helpers — single source of truth for the storefront.
// Mumbai, India: prices in INR (₹).

export const CURRENCY = '₹';

// Free delivery on orders above this; otherwise a flat fee.
export const FREE_SHIPPING_THRESHOLD = 250;
export const FLAT_SHIPPING = 49;

/** Format a whole-rupee amount, e.g. 1900 -> "₹1,900". */
export function inr(amount: number): string {
  return CURRENCY + amount.toLocaleString('en-IN');
}

/** Shipping fee for a given subtotal (free above the threshold, free when empty). */
export function shippingFor(subtotal: number): number {
  return subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
}
