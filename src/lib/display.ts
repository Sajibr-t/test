// Visual helpers for product cards.

// Stock photos (Unsplash) mapped per seeded style; replace with real
// product photography by dropping files into /public/images.
const PRODUCT_IMAGES: Record<string, string> = {
  // LittleWhale baby catalog
  "BDRS-101": "/images/product-dress.jpg",
  "BHOD-201": "/images/product-hoodie.jpg",
  "BROM-301": "/images/product-onesie.jpg",
  "BDRS-401": "/images/season-spring.jpg",
  "BOVR-501": "/images/product-shorts.jpg",
  "BNEW-601": "/images/product-onesie.jpg",
  // legacy kids catalog
  "KTEE-101": "/images/product-tee.jpg",
  "KDRS-201": "/images/product-dress.jpg",
  "KHOD-301": "/images/product-hoodie.jpg",
  "KSHT-401": "/images/product-shorts.jpg",
  "KSNK-501": "/images/product-sneakers.jpg",
  "KNBW-601": "/images/product-onesie.jpg",
};

export function productImage(styleCode: string): string | null {
  return PRODUCT_IMAGES[styleCode] ?? null;
}

const CATEGORY_IMAGES: [RegExp, string][] = [
  [/newborn|onesie|romper|baby/i, "/images/product-onesie.jpg"],
  [/infant/i, "/images/product-onesie.jpg"],
  [/toddler/i, "/images/product-hoodie.jpg"],
  [/girl/i, "/images/product-dress.jpg"],
  [/boy/i, "/images/product-shorts.jpg"],
  [/t-?shirt|tee/i, "/images/product-tee.jpg"],
  [/dress|skirt/i, "/images/product-dress.jpg"],
  [/hood|sweat|fleece|jacket|coat|outer/i, "/images/product-hoodie.jpg"],
  [/denim|jean|pant|trouser|short|bottom/i, "/images/product-shorts.jpg"],
  [/shoe|sneaker|boot|footwear/i, "/images/product-sneakers.jpg"],
];

export function categoryImage(category: string): string | null {
  for (const [re, img] of CATEGORY_IMAGES) {
    if (re.test(category)) return img;
  }
  return null;
}

const CATEGORY_EMOJI: [RegExp, string][] = [
  [/girl/i, "🎀"],
  [/boy/i, "🧢"],
  [/infant/i, "🍼"],
  [/t-?shirt|tee/i, "👕"],
  [/hood|sweat|fleece|jacket|coat|outer/i, "🧥"],
  [/denim|jean|pant|trouser|short|bottom/i, "👖"],
  [/dress|skirt/i, "👗"],
  [/shirt|blouse|top/i, "👔"],
  [/knit|sweater|cardigan/i, "🧶"],
  [/accessor|hat|cap|scarf|belt|bag/i, "🧢"],
  [/shoe|sneaker|boot|footwear/i, "👟"],
  [/newborn|onesie|romper/i, "👶"],
  [/kid|baby|children|toddler/i, "🧸"],
  [/sale/i, "🏷️"],
];

export function categoryEmoji(category: string): string {
  for (const [re, emoji] of CATEGORY_EMOJI) {
    if (re.test(category)) return emoji;
  }
  return "🧵";
}

// Soft pastel card backgrounds cycled per category for visual variety
const TILE_BG = ["#E3F5FE", "#E8F0FF", "#E8FAF0", "#FFF5E0", "#EDE8FF"];

export function categoryTileBg(category: string): string {
  let hash = 0;
  for (const ch of category) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return TILE_BG[hash % TILE_BG.length];
}

// Map a variant color name to a display swatch hex
const SWATCHES: [RegExp, string][] = [
  [/denim/i, "#5E7FA6"],
  [/cherry|red/i, "#C0392B"],
  [/pink|blossom|rose/i, "#F3B8C6"],
  [/cream|beige|sand/i, "#E5D5BC"],
  [/white|cloud/i, "#F2F1EC"],
  [/sage|green|forest/i, "#BFD3B6"],
  [/butter|yellow|sun/i, "#F2DE9C"],
  [/cocoa|brown/i, "#7A5236"],
  [/navy/i, "#2C3E6B"],
  [/blue|sky/i, "#7FB3D8"],
  [/grey|gray|heather/i, "#C9C9C9"],
  [/black/i, "#3A3A3A"],
  [/floral|print/i, "#F3B8C6"],
];

export function colorSwatch(name: string): string {
  for (const [re, hex] of SWATCHES) {
    if (re.test(name)) return hex;
  }
  return "#D8D8D8";
}

// Best bulk saving vs base price, e.g. 24 (percent), or 0 if no breaks
export function bulkDiscountPct(
  basePrice: number,
  priceBreaks: { unitPrice: number }[]
): number {
  if (priceBreaks.length === 0) return 0;
  const lowest = Math.min(...priceBreaks.map((b) => b.unitPrice));
  if (lowest >= basePrice) return 0;
  return Math.round((1 - lowest / basePrice) * 100);
}
