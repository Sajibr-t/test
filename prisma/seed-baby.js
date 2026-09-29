// Switches the catalog to the LittleWhale baby clothing line:
// deactivates existing products, adds baby styles. Run: node prisma/seed-baby.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
  {
    styleCode: "BDRS-101",
    name: "Floral Ruffle Dress",
    category: "Girls",
    description:
      "Sweet ruffle-sleeve dress in soft floral cotton. Snap-back closure for easy changes.",
    fabric: "100% cotton poplin",
    basePrice: 1050,
    moq: 18,
    colors: ["Pink Floral", "Cream Floral"],
    sizes: ["0-6M", "6-12M", "1-2Y", "2-3Y"],
    breaks: [
      { minQty: 36, unitPrice: 975 },
      { minQty: 90, unitPrice: 895 },
    ],
    pack: { name: "Standard prepack", contents: { "0-6M": 1, "6-12M": 2, "1-2Y": 2, "2-3Y": 1 } },
  },
  {
    styleCode: "BHOD-201",
    name: "Bear Hoodie Set",
    category: "Toddlers",
    description:
      "Two-piece brushed fleece set with bear-ear hood and jogger pants. Cozy and playground-proof.",
    fabric: "80% cotton / 20% polyester fleece",
    basePrice: 1450,
    moq: 12,
    colors: ["Beige", "Cocoa"],
    sizes: ["1-2Y", "2-3Y", "3-4Y"],
    breaks: [
      { minQty: 24, unitPrice: 1350 },
      { minQty: 60, unitPrice: 1225 },
    ],
    pack: { name: "Standard prepack", contents: { "1-2Y": 2, "2-3Y": 2, "3-4Y": 2 } },
  },
  {
    styleCode: "BROM-301",
    name: "Striped Romper",
    category: "Infants",
    description:
      "Breathable striped romper with full-length snaps and fold-over cuffs.",
    fabric: "95% cotton / 5% elastane rib",
    basePrice: 850,
    moq: 18,
    colors: ["Blue Stripe", "Pink Stripe"],
    sizes: ["3-6M", "6-9M", "9-12M"],
    breaks: [
      { minQty: 36, unitPrice: 775 },
      { minQty: 96, unitPrice: 695 },
    ],
    pack: { name: "Standard prepack", contents: { "3-6M": 2, "6-9M": 2, "9-12M": 2 } },
  },
  {
    styleCode: "BDRS-401",
    name: "Cherry Print Dress",
    category: "Girls",
    description:
      "Playful cherry-print dress with bow detail and gathered skirt. Ships poly-bagged.",
    fabric: "100% cotton",
    basePrice: 1150,
    moq: 18,
    colors: ["Cherry Red"],
    sizes: ["6-12M", "1-2Y", "2-3Y", "3-4Y"],
    breaks: [
      { minQty: 36, unitPrice: 1050 },
      { minQty: 90, unitPrice: 950 },
    ],
    pack: { name: "Standard prepack", contents: { "6-12M": 1, "1-2Y": 2, "2-3Y": 2, "3-4Y": 1 } },
  },
  {
    styleCode: "BOVR-501",
    name: "Denim Overall Set",
    category: "Boys",
    description:
      "Soft-wash denim overalls with tee, adjustable straps and bear patch pocket.",
    fabric: "Cotton denim, enzyme washed",
    basePrice: 1350,
    moq: 12,
    colors: ["Denim Blue"],
    sizes: ["6-12M", "1-2Y", "2-3Y", "3-4Y"],
    breaks: [
      { minQty: 24, unitPrice: 1250 },
      { minQty: 60, unitPrice: 1150 },
    ],
    pack: { name: "Standard prepack", contents: { "6-12M": 1, "1-2Y": 2, "2-3Y": 2, "3-4Y": 1 } },
  },
  {
    styleCode: "BNEW-601",
    name: "Cloud Soft Onesie 3-Pack",
    category: "Newborn",
    description:
      "Buttery-soft ribbed onesies with envelope necks. Sold as 3-packs, gift-ready.",
    fabric: "95% cotton / 5% elastane rib",
    basePrice: 1250,
    moq: 12,
    colors: ["Cloud White", "Soft Sage", "Butter"],
    sizes: ["0-3M", "3-6M", "6-9M"],
    breaks: [
      { minQty: 24, unitPrice: 1150 },
      { minQty: 72, unitPrice: 1025 },
    ],
    pack: { name: "Standard prepack", contents: { "0-3M": 1, "3-6M": 1, "6-9M": 1 } },
  },
];

async function main() {
  const hidden = await prisma.product.updateMany({
    where: { styleCode: { notIn: products.map((p) => p.styleCode) } },
    data: { active: false },
  });
  if (hidden.count > 0) console.log(`Deactivated ${hidden.count} old product(s)`);

  for (const p of products) {
    if (await prisma.product.findUnique({ where: { styleCode: p.styleCode } })) {
      continue;
    }
    await prisma.product.create({
      data: {
        styleCode: p.styleCode,
        name: p.name,
        category: p.category,
        description: p.description,
        fabric: p.fabric,
        basePrice: p.basePrice,
        moq: p.moq,
        variants: {
          create: p.colors.flatMap((color) =>
            p.sizes.map((size) => ({
              color,
              size,
              sku: `${p.styleCode}-${color.replace(/\s+/g, "").toUpperCase()}-${size}`,
              stock: 100,
            }))
          ),
        },
        priceBreaks: { create: p.breaks },
        packs: {
          create: [{ name: p.pack.name, contents: JSON.stringify(p.pack.contents) }],
        },
      },
    });
    console.log(`Created ${p.styleCode} — ${p.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
