// Creates a separate test database in TEMP. Never reads or writes DATABASE_URL.
// Existing fixture databases are reused so this script does not delete any data.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { DatabaseSync } = require("node:sqlite");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const dbPath = path.join(os.tmpdir(), "tinythreads-shop-design-review.db");

async function main() {
  if (fs.existsSync(dbPath)) {
    console.log("Fixture database already exists: " + dbPath);
    return;
  }
  const db = new DatabaseSync(dbPath);
  db.exec(fs.readFileSync("prisma/migrations/20260925172002_init/migration.sql", "utf8"));
  // The current repository schema has translation columns missing from its migration history.
  db.exec("ALTER TABLE Product ADD COLUMN nameMs TEXT; ALTER TABLE Product ADD COLUMN descriptionMs TEXT;");
  db.close();
  const prisma = new PrismaClient({ datasourceUrl: "file:" + dbPath.replaceAll("\\", "/") });
  try {
    const passwordHash = await bcrypt.hash("Review-test-2026", 10);
    for (const [id, email, status] of [["review-buyer", "review@example.test", "APPROVED"], ["review-pending", "pending@example.test", "PENDING"]]) {
      await prisma.user.create({ data: { id, email, passwordHash, status, role: "BUYER", businessName: "Review Boutique", contactName: "Test Buyer" } });
    }
    const products = [
      ["BDRS-101", "Floral Ruffle Dress", "Girls", ["Pink Floral", "Cream Floral"]],
      ["BHOD-201", "Bear Hoodie Set", "Toddlers", ["Beige", "Cocoa"]],
      ["BROM-301", "Striped Romper", "Infants", ["Blue Stripe", "Pink Stripe"]],
      ["BDRS-401", "Cherry Print Dress", "Girls", ["Cherry Red"]],
      ["BOVR-501", "Denim Overall Set", "Boys", ["Denim Blue"]],
      ["BNEW-601", "Cloud Soft Onesie 3-Pack", "Newborn", ["Cloud White", "Soft Sage", "Butter"]],
    ];
    for (const [index, [styleCode, name, category, colors]] of products.entries()) {
      const i = index + 1;
      await prisma.product.create({ data: {
        id: "review-product-" + i, styleCode, name, category, fabric: "100% cotton",
        description: "Soft cotton essentials for little everyday adventures.", basePrice: 1000 + i * 50, moq: 12,
        variants: { create: colors.flatMap(color => ["0-3M", "3-6M", "6-9M"].map(size => ({ color, size, sku: styleCode + "-" + color + "-" + size, stock: 100 }))) },
        packs: { create: { id: "review-pack-" + i, name: "Standard prepack", contents: JSON.stringify({ "0-3M": 1, "3-6M": 2, "6-9M": 1 }) } },
        priceBreaks: { create: [{ minQty: 24, unitPrice: 900 + i * 50 }, { minQty: 48, unitPrice: 800 + i * 50 }] },
      } });
    }
    console.log("Created isolated review database: " + dbPath);
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
