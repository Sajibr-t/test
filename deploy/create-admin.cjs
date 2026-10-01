// Creates (or resets the password of) an admin account on the server.
// Run from the app folder:  node deploy/create-admin.cjs
const readline = require("node:readline/promises");
const fs = require("node:fs");
if (fs.existsSync(".env")) process.loadEnvFile(".env");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password (12+ characters): ");
  rl.close();
  if (!email.includes("@")) throw new Error("Enter a valid email.");
  if (password.length < 12) throw new Error("Use at least 12 characters.");

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", status: "APPROVED", sessionVersion: { increment: 1 } },
    create: { email, passwordHash, role: "ADMIN", status: "APPROVED", emailVerifiedAt: new Date(), businessName: "Store Admin", contactName: "Store Admin" },
  });
  await prisma.$disconnect();
  console.log(`Admin ready: ${email}`);
}

main().catch(error => { console.error(error.message); process.exit(1); });
