// Currency + locale helpers — single source of truth for the storefront.
// Mumbai, India: prices in INR (₹).

export const CURRENCY = '₹';

// Free delivery on orders above this; otherwise a flat fee.
export const FREE_SHIPPING_THRESHOLD = 250;
export const FLAT_SHIPPING = 49;

// Show an "Only X left" urgency message when stock is at or below this.
// Change here once — every product surface uses it.
export const LOW_STOCK_THRESHOLD = 10;

/** Format a whole-rupee amount, e.g. 1900 -> "₹1,900". */
export function inr(amount: number): string {
  return CURRENCY + amount.toLocaleString('en-IN');
}

/** Shipping fee for a given subtotal (free above the threshold, free when empty). */
export function shippingFor(subtotal: number): number {
  return subtotal > FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
}

/**
 * Low-stock urgency label, or null when it shouldn't show.
 * Returns "Only N left!" only when 0 < stock <= LOW_STOCK_THRESHOLD.
 * `stock` may be undefined (e.g. static fallback data) — then nothing shows.
 */
export function lowStockLabel(stock: number | undefined): string | null {
  if (stock === undefined || stock <= 0 || stock > LOW_STOCK_THRESHOLD) return null;
  return `Only ${stock} left!`;
}
