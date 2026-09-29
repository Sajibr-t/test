// Seeds the database with an admin account, a demo approved buyer,
// and sample products. Run with: node prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  if (!(await prisma.user.findUnique({ where: { email: adminEmail } }))) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        status: "APPROVED",
        businessName: "Wholesale Clothing Co.",
        contactName: "Store Admin",
      },
    });
    console.log("Created admin: admin@example.com / admin123");
  }

  const buyerEmail = "buyer@example.com";
  if (!(await prisma.user.findUnique({ where: { email: buyerEmail } }))) {
    await prisma.user.create({
      data: {
        email: buyerEmail,
        passwordHash: await bcrypt.hash("buyer123", 10),
        role: "BUYER",
        status: "APPROVED",
        businessName: "Demo Retail Boutique",
        contactName: "Demo Buyer",
        phone: "555-0100",
        address: "123 Market Street\nSpringfield",
      },
    });
    console.log("Created demo buyer: buyer@example.com / buyer123");
  }

  const products = [
    {
      styleCode: "TEE-100",
      name: "Classic Crew Neck Tee",
      category: "T-Shirts",
      description:
        "Everyday heavyweight crew neck tee. Pre-shrunk, side-seamed, retail-ready.",
      fabric: "100% combed cotton, 180 GSM",
      basePrice: 950,
      moq: 24,
      colors: ["Black", "White", "Heather Grey"],
      sizes: ["S", "M", "L", "XL"],
      breaks: [
        { minQty: 48, unitPrice: 875 },
        { minQty: 96, unitPrice: 800 },
        { minQty: 240, unitPrice: 725 },
      ],
      pack: { name: "Standard prepack", contents: { S: 1, M: 2, L: 2, XL: 1 } },
    },
    {
      styleCode: "HOOD-200",
      name: "Fleece Pullover Hoodie",
      category: "Hoodies",
      description:
        "Midweight brushed-fleece hoodie with kangaroo pocket and double-lined hood.",
      fabric: "80% cotton / 20% polyester, 320 GSM",
      basePrice: 2450,
      moq: 12,
      colors: ["Black", "Navy", "Sand"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      breaks: [
        { minQty: 24, unitPrice: 2250 },
        { minQty: 60, unitPrice: 2050 },
        { minQty: 120, unitPrice: 1875 },
      ],
      pack: {
        name: "Standard prepack",
        contents: { S: 1, M: 2, L: 2, XL: 2, XXL: 1 },
      },
    },
    {
      styleCode: "DNM-300",
      name: "Slim Fit Stretch Jeans",
      category: "Denim",
      description:
        "5-pocket slim fit jeans in stretch denim. Consistent wash lot to lot.",
      fabric: "98% cotton / 2% elastane, 11 oz",
      basePrice: 1850,
      moq: 18,
      colors: ["Indigo", "Washed Black"],
      sizes: ["28", "30", "32", "34", "36"],
      breaks: [
        { minQty: 36, unitPrice: 1700 },
        { minQty: 90, unitPrice: 1550 },
      ],
      pack: {
        name: "Size run",
        contents: { "28": 1, "30": 2, "32": 2, "34": 2, "36": 1 },
      },
    },
    {
      styleCode: "DRS-400",
      name: "Floral Midi Dress",
      category: "Dresses",
      description:
        "Season-proof floral midi with elastic waist. Ships on hangers, poly-bagged.",
      fabric: "100% viscose",
      basePrice: 2150,
      moq: 12,
      colors: ["Rose Print", "Blue Print"],
      sizes: ["XS", "S", "M", "L"],
      breaks: [
        { minQty: 24, unitPrice: 1975 },
        { minQty: 48, unitPrice: 1800 },
      ],
      pack: { name: "Standard prepack", contents: { XS: 1, S: 2, M: 2, L: 1 } },
    },
  ];

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
    console.log(`Created product ${p.styleCode} — ${p.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
