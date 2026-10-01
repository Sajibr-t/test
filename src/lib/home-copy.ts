import type { Lang } from "./i18n";

const en = {
  skip: "Skip to content", navigation: "Main navigation", menu: "Open menu", announcement: "Little favourites for babies, kids & the shops that love them",
  collections: "Collections", how: "How it works", pricing: "Wholesale details", faq: "FAQs", shop: "Shop Baby & Kids", apply: "Apply for wholesale", startOrder: "Start your order", application: "Application status",
  eyebrow: "BABY & KIDS · MADE FOR YOUR LITTLE SHOP", titleFirst: "Little outfits.", titleLast: "Big happy adventures.", intro: "From sleepy snuggles to playground days. Discover baby and kids’ clothing for your boutique, with flexible size runs and wholesale ordering made simple.",
  noteOne: "Browse before you apply", noteTwo: "Net 30 invoice terms", kidsAlt: "A smiling child in a floral outfit with a teddy bear", babyAlt: "A baby wearing a cosy hooded outfit", babyToKids: "Baby days to big adventures", stickerFirst: "Small clothes,", stickerLast: "so much joy!",
  stripOne: "For babies & growing kids", stripTwo: "Prepacks & individual sizes", stripThree: "Minimums shown on every style",
  categoryEyebrow: "FIND THEIR NEXT LITTLE FAVOURITE", categoryTitle: "A little something for every adventure", seeAll: "Explore the shop", styles: "styles", empty: "There are no styles listed right now. You can still apply for a trade account.",
  featuredEyebrow: "FRESH FROM THE COLLECTION", featuredTitle: "Little looks to love", seeNew: "See new arrivals", view: "View product", minimum: "Minimum", units: "garments", unit: "garment", from: "From", loginPrices: "Log in for trade prices",
  howEyebrow: "YOUR NEXT COLLECTION STARTS HERE", howTitle: "From our little shop to yours", howIntro: "Three simple steps to your first wholesale order.",
  steps: [
    { title: "Say hello", body: "Apply for a trade account with your business details. Your application is reviewed before wholesale ordering is unlocked." },
    { title: "Pick your favourites", body: "Once approved, see trade prices and choose colours, individual sizes or prepacks. Minimum quantities are shown on every style." },
    { title: "Place your order", body: "Submit your selection and receive a Net 30 invoice. You can follow the order status and print your invoice from your account." },
  ],
  pricingEyebrow: "SMALL DETAILS. NO GUESSWORK.", pricingTitle: "Wholesale that makes sense", pricingBody: "Every style has its own minimum and quantity prices. Approved buyers can see the price breaks on product cards and an estimate before adding to their order.",
  facts: [
    { title: "Mix sizes within a style", body: "Combine colours, individual sizes and prepacks to meet that product’s minimum quantity." },
    { title: "Volume prices per product", body: "Quantity breaks use the total garments of each style in your cart. The applicable prices are checked again at checkout." },
    { title: "Pay by invoice", body: "Orders generate a Net 30 invoice. No card payment is collected at checkout; availability is confirmed when your order is reviewed." },
  ],
  faqEyebrow: "A FEW LITTLE ANSWERS", faqTitle: "Wondering about wholesale?", faqIntro: "Here’s what to know before building your first collection.",
  questions: [
    { title: "Can I browse without an account?", body: "Yes. You can explore the collection and product details before applying. Trade prices and ordering are available after your account is approved." },
    { title: "What is the minimum order quantity?", body: "It varies by product. Each style shows its minimum in garments. You can mix sizes and colours within that style to reach it." },
    { title: "How do prepacks work?", body: "A prepack contains a fixed mix of sizes. The product card shows the size run and garment count. Requested garment quantities round up to whole packs." },
    { title: "When do I pay?", body: "Placing an order creates an invoice with Net 30 terms, due 30 days after issue. Your invoice and order status are available in My Orders." },
    { title: "Is the displayed stock guaranteed?", body: "Stock is indicative. Availability is confirmed when the order is reviewed. You can add delivery requests in your order notes." },
  ],
  applyEyebrow: "LET’S GROW SOMETHING LOVELY", applyTitle: "Your next little collection starts here.", applyBody: "Tell us about your business and apply for access to wholesale prices and ordering.", browseFirst: "Just looking? Browse the collection",
};

const ms: typeof en = {
  skip: "Langkau ke kandungan", navigation: "Navigasi utama", menu: "Buka menu", announcement: "Gaya kegemaran bayi, kanak-kanak & kedai yang menyayangi mereka",
  collections: "Koleksi", how: "Cara memesan", pricing: "Maklumat borong", faq: "Soalan lazim", shop: "Beli untuk Bayi & Kanak-kanak", apply: "Mohon akaun borong", startOrder: "Mulakan pesanan", application: "Status permohonan",
  eyebrow: "BAYI & KANAK-KANAK · UNTUK KEDAI ANDA", titleFirst: "Pakaian si kecil.", titleLast: "Pengembaraan ceria.", intro: "Dari waktu tidur hingga bermain. Temui pakaian bayi dan kanak-kanak untuk butik anda, dengan pilihan pek saiz dan pesanan borong yang mudah.",
  noteOne: "Lihat koleksi sebelum memohon", noteTwo: "Terma invois Net 30", kidsAlt: "Kanak-kanak tersenyum memakai pakaian bunga bersama beruang teddy", babyAlt: "Bayi memakai pakaian berhud yang selesa", babyToKids: "Dari bayi hingga pengembaraan besar", stickerFirst: "Pakaian kecil,", stickerLast: "kegembiraan besar!",
  stripOne: "Untuk bayi & kanak-kanak", stripTwo: "Pek & saiz individu", stripThree: "Minimum tertera pada setiap gaya",
  categoryEyebrow: "CARI GAYA KEGEMARAN SI KECIL", categoryTitle: "Sesuatu untuk setiap pengembaraan", seeAll: "Terokai kedai", styles: "gaya", empty: "Tiada gaya disenaraikan buat masa ini. Anda masih boleh memohon akaun borong.",
  featuredEyebrow: "TERBAHARU DALAM KOLEKSI", featuredTitle: "Gaya kecil yang disayangi", seeNew: "Lihat keluaran baharu", view: "Lihat produk", minimum: "Minimum", units: "helai", unit: "helai", from: "Dari", loginPrices: "Log masuk untuk harga borong",
  howEyebrow: "KOLEKSI ANDA BERMULA DI SINI", howTitle: "Dari kedai kami ke kedai anda", howIntro: "Tiga langkah mudah untuk pesanan borong pertama.",
  steps: [
    { title: "Perkenalkan kedai anda", body: "Mohon akaun borong dengan maklumat perniagaan anda. Permohonan disemak sebelum pesanan borong dibuka." },
    { title: "Pilih kegemaran anda", body: "Selepas diluluskan, lihat harga borong dan pilih warna, saiz individu atau pek. Kuantiti minimum tertera pada setiap gaya." },
    { title: "Buat pesanan", body: "Hantar pilihan anda dan terima invois Net 30. Ikuti status pesanan dan cetak invois melalui akaun anda." },
  ],
  pricingEyebrow: "BUTIRAN JELAS UNTUK ANDA", pricingTitle: "Borong yang mudah difahami", pricingBody: "Setiap gaya mempunyai minimum dan harga kuantiti tersendiri. Pembeli yang diluluskan boleh melihat harga pukal dan anggaran sebelum menambah ke pesanan.",
  facts: [
    { title: "Campur saiz dalam satu gaya", body: "Gabungkan warna, saiz individu dan pek untuk mencapai minimum produk itu." },
    { title: "Harga pukal mengikut produk", body: "Harga kuantiti berdasarkan jumlah helai setiap gaya dalam troli. Harga disemak semula semasa pesanan dibuat." },
    { title: "Bayar melalui invois", body: "Pesanan menghasilkan invois Net 30. Tiada bayaran kad semasa pesanan; ketersediaan disahkan semasa semakan pesanan." },
  ],
  faqEyebrow: "JAWAPAN UNTUK ANDA", faqTitle: "Ingin tahu tentang borong?", faqIntro: "Perkara yang perlu diketahui sebelum membina koleksi pertama anda.",
  questions: [
    { title: "Bolehkah saya melihat tanpa akaun?", body: "Ya. Terokai koleksi dan butiran produk sebelum memohon. Harga borong dan pesanan tersedia selepas akaun diluluskan." },
    { title: "Berapakah kuantiti minimum?", body: "Minimum berbeza mengikut produk dan dipaparkan dalam helai. Campur saiz dan warna dalam gaya yang sama untuk mencapainya." },
    { title: "Bagaimanakah pek berfungsi?", body: "Pek mengandungi campuran saiz tetap. Kad produk memaparkan saiz dan bilangan helai. Kuantiti helai dibundarkan ke pek penuh." },
    { title: "Bilakah saya perlu membayar?", body: "Pesanan menghasilkan invois Net 30, perlu dibayar dalam 30 hari dari tarikh dikeluarkan. Invois dan status tersedia dalam Pesanan Saya." },
    { title: "Adakah stok dipaparkan dijamin?", body: "Stok ialah panduan. Ketersediaan disahkan apabila pesanan disemak. Tambahkan permintaan penghantaran dalam nota pesanan." },
  ],
  applyEyebrow: "MARI BERKEMBANG BERSAMA", applyTitle: "Koleksi kecil anda bermula di sini.", applyBody: "Kongsi maklumat perniagaan anda dan mohon akses kepada harga serta pesanan borong.", browseFirst: "Ingin melihat dahulu? Terokai koleksi",
};

export function homeCopy(lang: Lang) { return lang === "ms" ? ms : en; }
