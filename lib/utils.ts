export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString("en-IN")}`;
  }
}

export function formatPriceRange(minPrice?: number, maxPrice?: number): string {
  if (minPrice && maxPrice) {
    if (minPrice === maxPrice) return formatPrice(minPrice);
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }
  if (minPrice) return `From ${formatPrice(minPrice)}`;
  if (maxPrice) return `Up to ${formatPrice(maxPrice)}`;
  return "Price on Request";
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
