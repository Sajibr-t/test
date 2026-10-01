import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const nodeRequire = createRequire(import.meta.url);

function load(file, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "exports", code)((name) => dependencies[name] ?? nodeRequire(name), exports);
  return exports;
}

const validation = load("src/lib/cart-validation.ts");
const pricing = load("src/lib/pricing.ts");
const i18n = load("src/lib/i18n.ts");
const product = {
  id: "test-style", name: "Test style", active: true, basePrice: 1000, moq: 6,
  priceBreaks: [{ minQty: 12, unitPrice: 800 }],
  packs: [{ id: "pack", contents: JSON.stringify({ "0-3M": 1, "3-6M": 2 }) }],
  variants: [{ id: "v1", color: "Sage", size: "0-3M" }, { id: "v2", color: "Sage", size: "3-6M" }, { id: "v3", color: "Blue", size: "0-3M" }],
};
const item = { productId: product.id, color: "Sage", size: "0-3M", qty: 6 };
const cart = load("src/lib/cart.ts", {
  "./session": {}, "next/headers": {}, "./db": { prisma: { product: { findMany: async () => [product] } } },
  "./pricing": pricing, "./i18n": i18n, "./cart-validation": validation,
});

test("rejects negative, fractional, non-finite and ambiguous cart lines", () => {
  for (const qty of [-1, 0, 1.5, NaN, Infinity, 10001]) assert.equal(validation.cartItemSchema.safeParse({ ...item, qty }).success, false);
  assert.equal(validation.cartItemSchema.safeParse({ ...item, packId: "pack" }).success, false);
});
test("validates full pack contents against the selected colour", () => {
  assert.equal(validation.selectionUnits(product, { productId: product.id, color: "Sage", packId: "pack", qty: 2 }), 6);
  assert.equal(validation.selectionUnits(product, { productId: product.id, color: "Blue", packId: "pack", qty: 2 }), null);
  assert.equal(validation.selectionUnits({ ...product, active: false }, item), null);
  assert.equal(validation.selectionUnits(product, { ...item, size: "XXL" }), null);
});
test("combines packs and loose units for volume prices and MOQ", async () => {
  const result = await cart.priceCart([item, { productId: product.id, color: "Sage", packId: "pack", qty: 2 }]);
  assert.equal(result.subtotal, 12 * 800);
  assert.deepEqual(result.lines.map(l => l.units), [6, 6]);
  assert.equal(result.moqIssues.length, 0);
});
test("invalid lines cannot inflate tiers or offset a valid subtotal", async () => {
  const result = await cart.priceCart([item, { ...item, qty: -5 }, { ...item, size: "missing", qty: 50 }]);
  assert.equal(result.subtotal, 6000);
  assert.equal(result.lines.length, 1);
  assert.equal(result.invalidItems, 2);
});
test("smaller quantities expose the exact MOQ shortfall", async () => {
  const result = await cart.priceCart([{ ...item, qty: 2 }]);
  assert.equal(result.moqIssues[0].moq - result.moqIssues[0].units, 4);
});
test("bounds the encoded cookie before the browser can discard it", () => {
  assert.equal(validation.cartFitsCookie([item]), true);
  assert.equal(validation.cartFitsCookie(Array(100).fill(item)), false);
});
test("public product DTOs exclude wholesale prices and stock records", () => {
  const display = load("src/lib/display.ts");
  const shop = load("src/lib/shop-products.ts", { "./db": {}, "./i18n": i18n, "./display": display, "./pricing": pricing, "./cart-validation": validation });
  const p = { ...product, styleCode: "TEST-1", category: "Newborn", fabric: "Cotton" };
  const publicProduct = shop.shopProduct(p, "en", false);
  assert.equal(publicProduct.pricing, null);
  assert.equal(JSON.stringify(publicProduct).includes('"unitPrice"'), false);
  assert.equal(shop.shopProduct(p, "en", true, 6).pricing.cartUnits, 6);
});

test("money inputs reject negatives, empty values and malformed amounts", () => {
  const { parseMoney } = load("src/lib/format.ts");
  for (const value of ["", "-3", "abc", "1.123", "Infinity", "9999999999999999999"]) assert.equal(parseMoney(value), null);
  assert.equal(parseMoney("RM 12.34"), 1234);
  assert.equal(parseMoney("0"), 0);
});

test("shipping and tax use integer cents with explicit rounding", () => {
  const { orderTotals } = load("src/lib/store-settings.ts", { "./db": {} });
  assert.deepEqual(orderTotals(10001, { shippingFee: 500, taxBasisPoints: 600 }), { shippingFee: 500, taxAmount: 630, total: 11131 });
});

test("language switching keeps local filters and rejects external redirect paths", async () => {
  // Capture the action's redirect without requiring a Next.js request context.
  let location;
  const action = load("src/app/actions/lang.ts", {
    "next/headers": { cookies: async () => ({ set() {} }) },
    "next/navigation": { redirect: value => { location = value; } },
    "@/lib/i18n": { LANG_COOKIE: "lang" },
  }).setLanguage;
  for (const returnTo of ["//example.test", "/\\example.test", "/\t/example.test", "https://example.test"]) {
    const form = new FormData(); form.set("returnTo", returnTo); form.set("lang", "ms");
    await action(form);
    assert.equal(location, "/", `Unsafe return path: ${JSON.stringify(returnTo)}`);
  }
  const form = new FormData(); form.set("returnTo", "/catalog?q=cotton&size=S");
  await action(form);
  assert.equal(location, "/catalog?q=cotton&size=S");
});

test("product creation rejects malformed and duplicate quantity price breaks before writing", async () => {
  let created = false;
  const actions = load("src/app/actions/admin.ts", {
    "@/lib/email": {}, "@/lib/order-service": {},
    "next/navigation": { redirect: location => { throw new Error(location); } },
    "@/lib/session": { requireAdmin: async () => {} },
    "@/lib/format": load("src/lib/format.ts"),
    "@/lib/db": { prisma: { product: {
      findUnique: async () => null,
      create: async () => { created = true; return { id: "created" }; },
    } } },
  });
  for (const priceBreaks of ["oops", "0: 5.00", "12: -1", "12: 8.00\n12: 7.00", "999999999999: 5.00"]) {
    const form = new FormData();
    for (const [key, value] of Object.entries({ styleCode: "TEST", name: "Test", category: "Baby", basePrice: "10", moq: "6", colors: "Sage", sizes: "S, M", priceBreaks })) form.set(key, value);
    await assert.rejects(actions.createProduct(form), { message: "/admin/products/new?error=invalid" });
    assert.equal(created, false);
  }
});
