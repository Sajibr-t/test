import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tinythreads-orders-"));
const filename = path.join(directory, "test.db");
const sqlite = new DatabaseSync(filename);
for (const folder of fs.readdirSync("prisma/migrations").sort()) {
  const file = path.join("prisma/migrations", folder, "migration.sql");
  if (fs.existsSync(file)) sqlite.exec(fs.readFileSync(file, "utf8"));
}
sqlite.close();
const db = new PrismaClient({ datasourceUrl: "file:" + filename.replaceAll("\\", "/") });
after(async () => { await db.$disconnect(); fs.rmSync(directory, { recursive: true, force: true }); });
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  modules.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "exports", source)(name => {
    if (name === "./db") return { prisma: db };
    if (name === "./session") return {};
    if (name === "next/headers") return {};
    if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name + ".ts"));
    return require(name);
  }, exports);
  return exports;
}
const { submitOrder, changeOrderStatus } = load(path.resolve("src/lib/order-service.ts"));
async function fixture(stock = 20) {
  await db.storeSettings.upsert({ where: {id: 'store'}, create: {id: 'store', value: JSON.stringify({businessName:'Fixture', businessAddress:'Test address', supportEmail:'test@example.test', paymentInstructions:'Fixture only', shippingCountries:['Malaysia'], checkoutEnabled:true})}, update: {} });
  const id = randomUUID();
  const user = await db.user.create({ data: { email: id + "@example.test", passwordHash: "unused", businessName: "Fixture", contactName: "Buyer", status: "APPROVED" } });
  const product = await db.product.create({ data: { styleCode: id, name: "Test", category: "Baby", basePrice: 100, moq: 1,
    variants: { create: [{ sku: id + "-S", color: "Sage", size: "S", stock }, { sku: id + "-M", color: "Sage", size: "M", stock }] },
    packs: { create: { name: "Run", contents: '{"S":1,"M":2}' } },
  }, include: { variants: true, packs: true } });
  const input = { userId: user.id, key: randomUUID(), lang: "en", notes: null, delivery: {name:"Buyer",phone:"123456",address:"Test street",city:"Test city",postalCode:"12345",country:"Malaysia"},
    cart: [{ productId: product.id, color: "Sage", packId: product.packs[0].id, qty: 3 }, { productId: product.id, color: "Sage", size: "S", qty: 2 }] };
  return { product, input };
}
test("checkout reserves combined prepack and loose stock, retry is idempotent, cancellation restores once", async () => {
  const { product, input } = await fixture();
  const order = await submitOrder(input, db);
  assert.equal(order.subtotal, 1100);
  assert.equal((await submitOrder(input, db)).id, order.id);
  let stock = await db.variant.findMany({ where: { productId: product.id }, orderBy: { size: "asc" } });
  assert.deepEqual(stock.map(s => s.stock), [14, 15]);
  await changeOrderStatus(order.id, "CANCELLED", db);
  await changeOrderStatus(order.id, "CANCELLED", db);
  stock = await db.variant.findMany({ where: { productId: product.id } });
  assert.deepEqual(stock.map(s => s.stock), [20, 20]);
  assert.equal((await db.invoice.findUnique({ where: { orderId: order.id } })).status, "VOID");
  await assert.rejects(changeOrderStatus(order.id, "CONFIRMED", db), /transition/);
});
test("insufficient stock leaves inventory, orders and invoices untouched", async () => {
  const { product, input } = await fixture(5);
  await assert.rejects(submitOrder(input, db), /stock/);
  assert.equal(await db.order.count({ where: { userId: input.userId } }), 0);
  assert.deepEqual((await db.variant.findMany({ where: { productId: product.id } })).map(v => v.stock), [5, 5]);
});

test("competing checkouts cannot oversell the same SKU", async () => {
  const { input, product } = await fixture(6);
  const results = await Promise.allSettled([submitOrder(input, db), submitOrder({ ...input, key: randomUUID() }, db)]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(await db.order.count({ where: { userId: input.userId } }), 1);
  const variants = await db.variant.findMany({ where: { productId: product.id }, orderBy: { size: "asc" } });
  assert.deepEqual(variants.map(v => v.stock), [0, 1]);
});

test("concurrent duplicate submissions create only one order and invoice", async () => {
  const { input } = await fixture();
  const results = await Promise.allSettled([submitOrder(input, db), submitOrder(input, db)]);
  assert.equal(await db.order.count({ where: { userId: input.userId } }), 1);
  const completed = results.filter(r => r.status === "fulfilled");
  assert.ok(completed.length >= 1);
  assert.equal((await submitOrder(input, db)).id, completed[0].value.id);
});
test("paid orders cannot be cancelled and unapproved users cannot submit", async () => {
  const { input } = await fixture();
  const order = await submitOrder(input, db);
  await db.invoice.update({ where: { orderId: order.id }, data: { status: "PAID" } });
  await assert.rejects(changeOrderStatus(order.id, "CANCELLED", db), /paid/);
  await db.user.update({ where: { id: input.userId }, data: { status: "REJECTED" } });
  await assert.rejects(submitOrder({ ...input, key: randomUUID() }, db), /invalid/);
});

test("delivery is validated and invoices preserve details after profile changes", async () => {
  const { input } = await fixture();
  await assert.rejects(submitOrder({ ...input, delivery: { ...input.delivery, country: "Unsupported" } }, db), /delivery/);
  await db.user.update({ where: { id: input.userId }, data: { savedCart: JSON.stringify(input.cart) } });
  const order = await submitOrder(input, db);
  await db.user.update({ where: { id: input.userId }, data: { businessName: "Changed name" } });
  const stored = await db.order.findUnique({ where: { id: order.id } });
  assert.equal(JSON.parse(stored.billingSnapshot).businessName, "Fixture");
  assert.equal(JSON.parse(stored.shippingSnapshot).city, "Test city");
  assert.equal((await db.user.findUnique({ where: { id: input.userId } })).savedCart, "[]");
  assert.equal(await db.emailMessage.count({ where: { dedupeKey: `order:${order.id}:received` } }), 1);
  await submitOrder(input, db);
  assert.equal(await db.emailMessage.count({ where: { dedupeKey: `order:${order.id}:received` } }), 1);
});

test("shipped orders require tracking and cannot be cancelled or reopened", async () => {
  const { input } = await fixture();
  const order = await submitOrder(input, db);
  await changeOrderStatus(order.id, "CONFIRMED", db);
  await assert.rejects(changeOrderStatus(order.id, "SHIPPED", db), /tracking/);
  await changeOrderStatus(order.id, "SHIPPED", db, { carrier: "Fixture carrier", trackingNumber: "TRACK-123" });
  assert.equal((await db.order.findUnique({ where: { id: order.id } })).trackingNumber, "TRACK-123");
  await assert.rejects(changeOrderStatus(order.id, "CANCELLED", db), /transition/);
});

test("single-use reset links expire, respect purpose and invalidate sessions", async () => {
  const { issueAccountToken, consumeAccountToken, rateLimit } = load(path.resolve("src/lib/account-security.ts"));
  const { input } = await fixture();
  const original = process.env.SITE_URL;
  process.env.SITE_URL = "https://store.example.test";
  try {
    await issueAccountToken(input.userId, "RESET", db);
    const user = await db.user.findUnique({ where: { id: input.userId } });
    const message = await db.emailMessage.findFirst({ where: { to: user.email } });
    const raw = message.text.match(/token=([a-f0-9]{64})/)[1];
    assert.equal(await consumeAccountToken(raw, "VERIFY", undefined, db), false);
    assert.equal(await consumeAccountToken(raw, "RESET", "short", db), false);
    assert.equal(await consumeAccountToken(raw, "RESET", "New-password-2026", db), true);
    assert.equal(await consumeAccountToken(raw, "RESET", "New-password-2026", db), false);
    assert.equal((await db.user.findUnique({ where: { id: user.id } })).sessionVersion, 1);
    await issueAccountToken(user.id, "VERIFY", db);
    await db.accountToken.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(0) } });
    const verification = await db.emailMessage.findFirst({ where: { to: user.email, subject: { startsWith: "Verify" } } });
    assert.equal(await consumeAccountToken(verification.text.match(/token=([a-f0-9]{64})/)[1], "VERIFY", undefined, db), false);
    for (let i = 0; i < 3; i++) assert.equal(await rateLimit("test", user.id, 3, 3600, db), true);
    assert.equal(await rateLimit("test", user.id, 3, 3600, db), false);
  } finally { if (original === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = original; }
});

test("email delivery uses provider idempotency and retains failed messages for retry", async () => {
  const { deliverEmails } = load(path.resolve("src/lib/email.ts"));
  await db.emailMessage.deleteMany();
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY, originalFrom = process.env.EMAIL_FROM;
  process.env.RESEND_API_KEY = "fixture-key"; process.env.EMAIL_FROM = "test@example.test";
  try {
    const message = await db.emailMessage.create({ data: { to: "buyer@example.test", subject: "Test", text: "Test body", dedupeKey: "delivery-test" } });
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    assert.equal((await deliverEmails()).failed, 1);
    assert.equal((await db.emailMessage.findUnique({ where: { id: message.id } })).text, "Test body");
    await db.emailMessage.update({ where: { id: message.id }, data: { lockedUntil: null } });
    globalThis.fetch = async (_url, options) => { assert.equal(options.headers["Idempotency-Key"], message.id); return new Response('{"id":"fixture"}', { status: 200 }); };
    assert.equal((await deliverEmails()).sent, 1);
    const saved = await db.emailMessage.findUnique({ where: { id: message.id } });
    assert.equal(saved.status, "SENT"); assert.equal(saved.text, "");
    assert.equal((await deliverEmails()).sent, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = originalFrom;
  }
});
