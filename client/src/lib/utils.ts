/**
 * Formats a price in the smallest currency unit (e.g. cents) to a
 * localized display string.
 *
 * @example formatPrice(1250, 'USD') → "$12.50"
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

/** Concatenates class names, filtering out falsy values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
