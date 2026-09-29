// Switches the sample catalog to kids clothing:
// deactivates existing products, adds kids styles. Run: node prisma/seed-kids.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const products = [
  {
    styleCode: "KTEE-101",
    name: "Palm Print Tee",
    category: "T-Shirts",
    description:
      "Soft jersey tee with a playful palm print. Pre-shrunk and tag-free for comfy little necks.",
    fabric: "100% combed cotton, 160 GSM",
    basePrice: 650,
    moq: 24,
    colors: ["Sky Blue", "White", "Sunny Yellow"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    breaks: [
      { minQty: 48, unitPrice: 595 },
      { minQty: 96, unitPrice: 545 },
      { minQty: 240, unitPrice: 495 },
    ],
    pack: { name: "Standard prepack", contents: { "2-3Y": 1, "4-5Y": 2, "6-7Y": 2, "8-9Y": 1 } },
  },
  {
    styleCode: "KDRS-201",
    name: "Sunny Days Dress",
    category: "Dresses",
    description:
      "Twirl-ready cotton dress with flutter sleeves. Machine-washable and playground-approved.",
    fabric: "100% cotton poplin",
    basePrice: 1150,
    moq: 18,
    colors: ["Buttercup", "Blossom Pink"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    breaks: [
      { minQty: 36, unitPrice: 1050 },
      { minQty: 90, unitPrice: 950 },
    ],
    pack: { name: "Standard prepack", contents: { "2-3Y": 1, "4-5Y": 2, "6-7Y": 2, "8-9Y": 1 } },
  },
  {
    styleCode: "KHOD-301",
    name: "Explorer Hoodie",
    category: "Hoodies",
    description:
      "Cozy brushed-fleece hoodie with adventure badge embroidery. Double-stitched for rough play.",
    fabric: "80% cotton / 20% polyester, 280 GSM",
    basePrice: 1350,
    moq: 12,
    colors: ["Royal Blue", "Sunshine", "Forest"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    breaks: [
      { minQty: 24, unitPrice: 1250 },
      { minQty: 60, unitPrice: 1125 },
      { minQty: 120, unitPrice: 995 },
    ],
    pack: {
      name: "Standard prepack",
      contents: { "2-3Y": 1, "4-5Y": 2, "6-7Y": 2, "8-9Y": 2, "10-11Y": 1 },
    },
  },
  {
    styleCode: "KSHT-401",
    name: "Denim Play Shorts",
    category: "Bottoms",
    description:
      "Stretchy pull-on denim shorts with an elastic waist — no buttons, no fuss.",
    fabric: "98% cotton / 2% elastane",
    basePrice: 850,
    moq: 24,
    colors: ["Light Wash", "Mid Wash"],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    breaks: [
      { minQty: 48, unitPrice: 775 },
      { minQty: 120, unitPrice: 695 },
    ],
    pack: { name: "Standard prepack", contents: { "2-3Y": 1, "4-5Y": 2, "6-7Y": 2, "8-9Y": 1 } },
  },
  {
    styleCode: "KSNK-501",
    name: "Sporty Sneakers",
    category: "Footwear",
    description:
      "Lightweight hook-and-loop sneakers kids can put on themselves. Flexible non-slip sole.",
    fabric: "Canvas upper, EVA sole",
    basePrice: 1450,
    moq: 12,
    colors: ["Blue", "Pink"],
    sizes: ["EU24", "EU26", "EU28", "EU30"],
    breaks: [
      { minQty: 24, unitPrice: 1325 },
      { minQty: 60, unitPrice: 1195 },
    ],
    pack: { name: "Size run", contents: { EU24: 1, EU26: 2, EU28: 2, EU30: 1 } },
  },
  {
    styleCode: "KNBW-601",
    name: "Cloud Soft Onesie 3-Pack",
    category: "Newborn",
    description:
      "Buttery-soft ribbed onesies with envelope necks and snap closures. Sold as 3-packs.",
    fabric: "95% cotton / 5% elastane rib",
    basePrice: 1250,
    moq: 12,
    colors: ["Cloud White", "Soft Sage", "Butter"],
    sizes: ["0-3M", "3-6M", "6-9M", "9-12M"],
    breaks: [
      { minQty: 24, unitPrice: 1150 },
      { minQty: 72, unitPrice: 1025 },
    ],
    pack: {
      name: "Standard prepack",
      contents: { "0-3M": 1, "3-6M": 2, "6-9M": 2, "9-12M": 1 },
    },
  },
];

async function main() {
  const hidden = await prisma.product.updateMany({
    where: { styleCode: { notIn: products.map((p) => p.styleCode) } },
    data: { active: false },
  });
  if (hidden.count > 0) {
    console.log(`Deactivated ${hidden.count} old product(s)`);
  }

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
