// Fills in the Bahasa Malaysia copy for the baby line.
//
// Kept apart from seed-baby.js because that script skips products that already
// exist, so it can't backfill new columns onto a catalogue that is already
// seeded. This one matches on styleCode and is safe to re-run: it only writes
// the two `*Ms` columns and leaves everything else alone.
//
// Run: node prisma/seeds/seed-translations.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const translations = [
  {
    styleCode: "BDRS-101",
    nameMs: "Gaun Renda Berbunga",
    descriptionMs:
      "Gaun lengan berkerut yang manis dalam kapas berbunga lembut. Butang ketip di belakang memudahkan penukaran pakaian.",
  },
  {
    styleCode: "BDRS-401",
    nameMs: "Gaun Corak Ceri",
    descriptionMs:
      "Gaun bercorak ceri yang ceria dengan hiasan reben dan skirt berkedut. Dihantar dalam beg poli.",
  },
  {
    styleCode: "BHOD-201",
    nameMs: "Set Baju Berhud Beruang",
    descriptionMs:
      "Set dua helai daripada bulu berus dengan hud bertelinga beruang dan seluar jogger. Selesa dan tahan lasak di taman permainan.",
  },
  {
    styleCode: "BNEW-601",
    nameMs: "Pek 3 Helai Baju Romper Lembut Awan",
    descriptionMs:
      "Baju romper berib yang sangat lembut dengan leher sampul surat. Dijual dalam pek 3 helai, sedia untuk dihadiahkan.",
  },
  {
    styleCode: "BOVR-501",
    nameMs: "Set Jumpsuit Denim",
    descriptionMs:
      "Jumpsuit denim basuh lembut bersama kemeja-T, tali boleh laras dan poket tampal bermotif beruang.",
  },
  {
    styleCode: "BROM-301",
    nameMs: "Romper Berjalur",
    descriptionMs:
      "Romper berjalur yang menyerap udara dengan butang ketip penuh dan hujung lengan boleh dilipat.",
  },
];

async function main() {
  for (const tr of translations) {
    const result = await prisma.product.updateMany({
      where: { styleCode: tr.styleCode },
      data: { nameMs: tr.nameMs, descriptionMs: tr.descriptionMs },
    });
    if (result.count === 0) {
      console.log(`Skipped ${tr.styleCode} — no such product`);
    } else {
      console.log(`Translated ${tr.styleCode} — ${tr.nameMs}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
