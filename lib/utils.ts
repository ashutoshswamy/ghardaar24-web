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

export const pricePresets = [
  { value: "10000", label: "10K", fullLabel: "₹10,000" },
  { value: "50000", label: "50K", fullLabel: "₹50,000" },
  { value: "100000", label: "1L", fullLabel: "₹1 Lakh" },
  { value: "500000", label: "5L", fullLabel: "₹5 Lakh" },
  { value: "1000000", label: "10L", fullLabel: "₹10 Lakh" },
  { value: "2500000", label: "25L", fullLabel: "₹25 Lakh" },
  { value: "5000000", label: "50L", fullLabel: "₹50 Lakh" },
  { value: "7500000", label: "75L", fullLabel: "₹75 Lakh" },
  { value: "10000000", label: "1Cr", fullLabel: "₹1 Crore" },
  { value: "15000000", label: "1.5Cr", fullLabel: "₹1.5 Crore" },
  { value: "20000000", label: "2Cr", fullLabel: "₹2 Crore" },
  { value: "30000000", label: "3Cr", fullLabel: "₹3 Crore" },
  { value: "50000000", label: "5Cr", fullLabel: "₹5 Crore" },
  { value: "100000000", label: "10Cr", fullLabel: "₹10 Crore" },
];

export const formatPriceIndian = (value: string): string => {
  if (!value) return "";
  const num = parseInt(value);
  if (isNaN(num)) return "";
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 1)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(0)}K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export const parseIndianNotation = (input: string): string => {
  const cleaned = input.replace(/[₹,\s]/g, "").toUpperCase();

  // Match patterns like 10K, 50L, 1CR, 1.5CR, etc.
  const croreMatch = cleaned.match(/^(\d+\.?\d*)\s*CR$/);
  if (croreMatch) {
    return String(Math.round(parseFloat(croreMatch[1]) * 10000000));
  }

  const lakhMatch = cleaned.match(/^(\d+\.?\d*)\s*L$/);
  if (lakhMatch) {
    return String(Math.round(parseFloat(lakhMatch[1]) * 100000));
  }

  const thousandMatch = cleaned.match(/^(\d+\.?\d*)\s*K$/);
  if (thousandMatch) {
    return String(Math.round(parseFloat(thousandMatch[1]) * 1000));
  }

  // If just a number, return it
  const numMatch = cleaned.match(/^(\d+)$/);
  if (numMatch) {
    return numMatch[1];
  }

  return "";
};

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
