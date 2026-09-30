/**
 * Bilingual support: English and Bahasa Malaysia.
 *
 * The chosen language lives in a cookie, so it survives navigation and works
 * without JavaScript — the switcher is a plain form posting to a server action.
 * Pages read it with `getLang()` from "@/lib/i18n-server" and look strings up
 * with `t()` from here.
 *
 * This file deliberately imports nothing from `next/headers`, so the language
 * switcher (a Client Component) can import the dictionary and types too.
 *
 *   const lang = await getLang();
 *   <button>{t(lang, "cart.add")}</button>
 *
 * Adding a string means adding it to BOTH dictionaries below. The `Key` type is
 * derived from the English dictionary, so TypeScript fails the build if a key is
 * missing from Malay or if a page asks for a key that doesn't exist — a missing
 * translation can't slip through silently.
 *
 * Product names, descriptions and category names come from the database, so
 * they are not in here. `category()` below maps the few fixed category names
 * the catalogue ships with; anything a user types stays as typed.
 */

export type Lang = "en" | "ms";

export const LANGS: { code: Lang; label: string; long: string }[] = [
  { code: "en", label: "EN", long: "English" },
  { code: "ms", label: "BM", long: "Bahasa Malaysia" },
];

const en = {
  // ── header / navigation ──
  "nav.bestSellers": "Best Sellers",
  "nav.new": "New",
  "nav.baby": "Baby",
  "nav.offers": "Offers",
  "nav.myOrders": "My Orders",
  "nav.admin": "Admin",
  "nav.cart": "Cart",
  "nav.login": "Log in",
  "nav.logout": "Log out",
  "nav.apply": "Apply",
  "nav.searchPlaceholder": "What are you looking for?",
  "nav.shopAll": "Shop All",

  // ── mega menu ──
  "menu.newbornShop": "Newborn Shop",
  "menu.toddlerShop": "Toddler Shop",
  "menu.sleepwear": "Sleepwear",
  "menu.daywear": "Daywear",
  "menu.byAge": "By Age",
  "menu.onesies": "Onesies",
  "menu.rompers": "Rompers",
  "menu.threePacks": "3-Packs",
  "menu.dresses": "Dresses",
  "menu.hoodies": "Hoodies",
  "menu.overalls": "Overalls",
  "menu.matchingSets": "Matching Sets",
  "menu.allOffers": "All Offers",
  "menu.netTerms": "Net 30 Terms",

  // ── categories (fixed names the catalogue ships with) ──
  "cat.Newborn": "Newborn",
  "cat.Infants": "Infants",
  "cat.Toddlers": "Toddlers",
  "cat.Girls": "Girls",
  "cat.Boys": "Boys",

  // ── colourways (shared across styles — see `colour()`) ──
  "color.Butter": "Butter",
  "color.Cloud White": "Cloud White",
  "color.Soft Sage": "Soft Sage",
  "color.Denim Blue": "Denim Blue",
  "color.Cherry Red": "Cherry Red",
  "color.Blue Stripe": "Blue Stripe",
  "color.Pink Stripe": "Pink Stripe",
  "color.Beige": "Beige",
  "color.Cocoa": "Cocoa",
  "color.Cream Floral": "Cream Floral",
  "color.Pink Floral": "Pink Floral",

  // ── fabric compositions (shared across styles — see `fabric()`) ──
  "fabric.100% cotton": "100% cotton",
  "fabric.100% cotton poplin": "100% cotton poplin",
  "fabric.Cotton denim": "Cotton denim",
  "fabric.95% cotton / 5% elastane rib": "95% cotton / 5% elastane rib",
  "fabric.80% cotton / 20% polyester fleece":
    "80% cotton / 20% polyester fleece",

  // ── product cards / ordering ──
  "product.colour": "Colour",
  "product.size": "Size",
  "product.sizeOrPack": "Size or prepack",
  "product.units": "Units",
  "product.pack": "pack",
  "product.from": "From",
  "product.perUnit": "/unit",
  "product.moq": "MOQ",
  "product.save": "save",
  "product.sizeLabel": "Size",

  // ── prepack names (shared across styles — see `packName()`) ──
  "packname.Standard prepack": "Standard prepack",

  // ── country selector in the footer ──
  "country.MY": "Malaysia (MYR RM)",
  "country.SG": "Singapore (MYR RM)",
  "country.BN": "Brunei (MYR RM)",
  "country.ID": "Indonesia (MYR RM)",
  "cart.add": "Add to cart",
  "cart.added": "Added to your cart.",
  "cart.view": "View cart",

  // ── catalogue page ──
  "catalog.searchByCategory": "Search by category",
  "catalog.seeAllCategories": "See all categories",
  "catalog.prepacks": "Prepacks",
  "catalog.bulkDeals": "Bulk Deals",
  "catalog.newArrivals": "New Arrivals",
  "catalog.bestSellers": "Best Sellers",
  "catalog.saveBig": "Save Big",
  "catalog.ourBestDeals": "Our best deals",
  "catalog.bulkFavourites": "Bulk-price favourites",
  "catalog.shopAllDeals": "Shop all deals",
  "catalog.backToCatalogue": "← Back to catalogue",
  "catalog.allCategories": "← All categories",
  "catalog.nothingYet": "Nothing here just yet!",
  "catalog.browseEverything": "Browse everything",
  "catalog.noStylesInCategory": "No styles in this category yet!",
  "catalog.newIn": "New In",
  "catalog.newInSub": "Our latest additions, newest first",
  "catalog.saleTitle": "Sale & Bulk Deals",
  "catalog.resultsFor": "Results for",
  "catalog.stylesFound": "styles found",
  "catalog.styleFound": "style found",
  "catalog.stylesWithSavings": "styles with quantity-break savings",
  "catalog.styles": "styles",
  "catalog.style": "style",
  "catalog.categoryBlurb": "wholesale pricing with automatic quantity breaks",
  "catalog.tagline": "Soft on skin, easy on margins.",

  // ── hero slider ──
  "slider.specialOffer": "Special offer",
  "slider.upTo": "Up to",
  "slider.offOn": "off",
  "slider.bulkFrom": "Bulk pricing kicks in from",
  "slider.unitsBestRate": "units — best rate",
  "slider.moqJust": "MOQ just",
  "slider.shopThisDeal": "Shop this deal",
  "slider.netTitle": "Net 30 payment terms on every order",
  "slider.netSub":
    "Order today, pay in 30 days — every order automatically generates an invoice. No card needed at checkout.",
  "slider.howItWorks": "How it works",

  // ── collection banner ──
  "banner.title": "The Everyday Collection",
  "banner.sub":
    "The colours and prints your customers love — restocked in the softest organic cotton.",
  "banner.cta": "Shop New In",

  // ── editorial panel ──
  "editorial.eyebrow": "Why Choose Tiny Threads",
  "editorial.title1": "For Little Moments",
  "editorial.title2": "That Matter",
  "editorial.body":
    "We provide high-quality, stylish and comfortable baby clothing at wholesale prices. Our collections are designed with love — keeping little ones cosy while helping your business grow.",
  "editorial.premium": "Premium Quality",
  "editorial.premiumSub": "Soft & safe organic fabrics",
  "editorial.trendy": "Trendy Designs",
  "editorial.trendySub": "Stylish for every season",
  "editorial.pricing": "Wholesale Pricing",
  "editorial.pricingSub": "Better value for your business",
  "editorial.shipping": "Fast & Reliable Shipping",
  "editorial.shippingSub": "On-time delivery, always",

  // ── why panel ──
  "why.eyebrow": "Why TinyThreads?",
  "why.title": "Because every boutique deserves an easy restock",
  "why.prepacks": "Size-run prepacks",
  "why.prepacksSub":
    "Every pack arrives as a balanced size curve, so you never over-buy one size and sell out of another.",
  "why.terms": "Net 30 terms",
  "why.termsSub":
    "Order today, pay in 30 days. Every order generates an invoice automatically — no card at checkout.",
  "why.cotton": "GOTS-certified cotton",
  "why.cottonSub":
    "Certified organic fabric that is gentle on newborn skin and holds up wash after wash.",
  "why.breaks": "Automatic quantity breaks",
  "why.breaksSub":
    "Prices step down as your order grows — discounts apply themselves right in the cart.",

  // ── testimonials ──
  "testi.heading": "Don't just hear it from us.",
  "testi.t1": "A must for boutiques",
  "testi.q1":
    "MOQs that don't scare a small shop, and the quality sells itself. Our first prepack sold through in nine days.",
  "testi.t2": "We love TinyThreads!",
  "testi.q2":
    "Net 30 terms changed our cash flow completely. We've restocked three times this season without touching a card.",
  "testi.t3": "Sold through in a weekend",
  "testi.q3":
    "The bear hoodies were gone in one weekend. Reordered the bigger pack on Net 30 — easiest restock decision we've made.",
  "catalog.exploreAllDeals": "Explore All Deals",

  // ── filter sidebar (baby listing) ──
  "filter.filterBy": "Filter by",
  "filter.availability": "Availability",
  "filter.inStock": "In stock",
  "filter.outOfStock": "Out of stock",
  "filter.size": "Size",
  "filter.colour": "Color",
  "filter.category": "Category",
  "filter.fabric": "Fabric",
  "filter.products": "products",
  "filter.product": "product",
  "filter.sortBy": "Sort by",
  "filter.featured": "Featured",
  "filter.priceLowHigh": "Price: Low to High",
  "filter.priceHighLow": "Price: High to Low",
  "filter.newest": "Newest",
  "filter.noMatch": "No products match these filters.",
  "filter.clearAll": "Clear all filters",

  // ── value props ──
  "value.prepacks": "Size-run prepacks",
  "value.prepacksSub": "Balanced size curves in every pack",
  "value.shipping": "Free shipping over RM 2,000",
  "value.shippingSub": "Peninsular & East Malaysia, fully tracked",
  "value.exchanges": "7-day exchanges",
  "value.exchangesSub": "Swap sizes or styles hassle-free",
  "value.terms": "Net 30 terms",
  "value.termsSub": "Order today, pay in 30 days",

  // ── footer ──
  "footer.shop": "Shop",
  "footer.help": "Help",
  "footer.about": "About",
  "footer.newArrivals": "New Arrivals",
  "footer.bestSellers": "Best Sellers",
  "footer.sale": "Sale",
  "footer.sizeGuide": "Size Guide",
  "footer.shipping": "Shipping Info",
  "footer.returns": "Returns",
  "footer.faq": "FAQ",
  "footer.ourStory": "Our Story",
  "footer.contact": "Contact Us",
  "footer.becomePartner": "Become a partner",
  "footer.shoppingFrom": "I'm shopping from:",
  "footer.rights": "All rights reserved.",

  // ── footer: link-card column headings ──
  "footer.customerService": "Customer Service",
  "footer.account": "Account",
  "footer.usefulLinks": "Useful Links",
  "footer.moreGoodies": "More Goodies",
  "footer.partnerWithUs": "Partner With Us",

  // ── footer: link labels ──
  "footer.faqs": "FAQs",
  "footer.shippingPolicy": "Shipping Policy",
  "footer.login": "Login",
  "footer.myOrders": "My Orders",
  "footer.myCart": "My Cart",
  "footer.applyWholesale": "Apply for Wholesale",
  "footer.fabricGuide": "Fabric Guide",
  "footer.pricingTiers": "Pricing Tiers",
  "footer.bulkDeals": "Bulk Deals",
  "footer.seasonalSets": "Seasonal Sets",
  "footer.whyOrganic": "Why Organic Cotton",
  "footer.cares": "TinyThreads Cares",
  "footer.press": "Press",
  "footer.wholesale": "Wholesale",

  // ── footer: promo + newsletter ──
  "footer.promoTitle": "Unlock trade pricing on your order!",
  "footer.promoSub":
    "Be first to know about new drops + trade deals when you open a wholesale account.",
  "footer.consent":
    "By applying, you consent to receive order and marketing emails from TinyThreads (e.g. new collections, restock reminders). Approval is not a condition of purchase. Unsubscribe at any time via the link in every email.",
  "footer.privacyTerms": "Privacy Policy & Terms",
  "footer.newsletterTitle": "Sign up for new releases + deals",
  "footer.newsletterSub":
    "Get insider access to new products and promotions when you subscribe to our newsletter.",
  "footer.emailPlaceholder": "Your Email Address",
  "footer.subscribe": "Subscribe",
  "footer.recaptchaBefore": "This site is protected by reCAPTCHA and the Google",
  "footer.privacyPolicy": "Privacy Policy",
  "footer.and": "and",
  "footer.termsOfService": "Terms of Service",
  "footer.recaptchaAfter": "apply.",

  // ── footer: side cards ──
  "footer.caresBody":
    "Every season, we are proud to donate a portion of our proceeds to children's hospitals and early-childhood charities through the TinyThreads Cares program.",
  "footer.learnMore": "Learn More",
  "footer.clubTitle": "Join the Retailer Club",
  "footer.clubBody":
    "Make friends, swap merchandising tips, sell better. It's all inside our private community for boutique owners.",
  "footer.joinNow": "Join Now",

  // ── footer: bottom bar ──
  "footer.terms": "T's & C's",
  "footer.privacy": "Privacy",
  "footer.accessibility": "Accessibility",

  // ── cart page ──
  "cart.title": "Your cart",
  "cart.empty": "Cart is empty.",
  "cart.browse": "Browse the catalog",
  "cart.moqError":
    "Some styles are below their minimum order quantity — see the warnings below.",
  "cart.unitsInCart": "units in cart, minimum order is",
  "cart.addMore": "Add",
  "cart.moreUnits": "more units to order this style.",
  "cart.item": "Item",
  "cart.units": "Units",
  "cart.unitPrice": "Unit price",
  "cart.total": "Total",
  "cart.remove": "Remove",
  "cart.subtotal": "Subtotal",
  "cart.pricesNote":
    "Unit prices already include your quantity breaks. Shipping and tax are added to the invoice if applicable.",
  "cart.notes": "Order notes (optional)",
  "cart.notesPlaceholder": "Delivery instructions, requested ship date…",
  "cart.placeOrder": "Place order on Net 30 terms",
  "cart.clear": "Clear cart",
  "cart.invoiceNote":
    "Placing an order generates an invoice — no card payment is taken now.",

  // ── login / register / pending ──
  "auth.login": "Log in",
  "auth.invalid": "Invalid email or password.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.noAccount": "No account?",
  "auth.applyLink": "Apply for a trade account",
  "auth.haveAccount": "Already have an account?",
  "auth.loginLink": "Log in",
  "auth.registerTitle": "Apply for a trade account",
  "auth.registerIntro":
    "Wholesale pricing is only visible to approved businesses. We review every application.",
  "auth.businessName": "Business name",
  "auth.contactName": "Contact name",
  "auth.phone": "Phone",
  "auth.address": "Business address",
  "auth.taxId": "Tax / business registration ID",
  "auth.minChars": "(min 8 characters)",
  "auth.submitApplication": "Submit application",
  "auth.emailTaken":
    "An account with that email already exists — try logging in.",
  "auth.fillRequired":
    "Please fill in all required fields (password at least 8 characters).",
  // ── orders list + invoice ──
  "orders.title": "Orders",
  "orders.none": "No orders yet.",
  "orders.order": "Order",
  "orders.date": "Date",
  "orders.status": "Status",
  "orders.invoice": "Invoice",
  "orders.total": "Total",
  "orders.allOrders": "← All orders",
  "orders.placed":
    "Order placed! Your invoice is below — we'll confirm the order shortly.",
  "orders.issued": "Issued",
  "orders.due": "Due",
  "orders.terms": "Terms",
  "orders.paid": "PAID",
  "orders.unpaid": "UNPAID",
  "orders.billTo": "Bill to",
  "orders.description": "Description",
  "orders.units": "Units",
  "orders.unitPrice": "Unit price",
  "orders.amount": "Amount",
  "orders.totalDue": "Total due",
  "orders.notes": "Order notes:",
  "orders.paymentTerms": "Payment due within 30 days of issue. Please reference",
  "orders.withPayment": "with your payment.",
  "orders.print": "Print / save as PDF",

  // ── status badges (order, invoice and buyer statuses) ──
  "status.PENDING": "PENDING",
  "status.CONFIRMED": "CONFIRMED",
  "status.SHIPPED": "SHIPPED",
  "status.CANCELLED": "CANCELLED",
  "status.APPROVED": "APPROVED",
  "status.REJECTED": "REJECTED",
  "status.UNPAID": "UNPAID",
  "status.PAID": "PAID",

  "pending.rejectedTitle": "Application not approved",
  "pending.rejectedBody":
    "Unfortunately your trade account application was not approved. Contact us if you believe this is a mistake.",
  "pending.title": "Application received ✓",
  "pending.thanks": "Thanks",
  "pending.applicationFor": "Your application for",
  "pending.underReview":
    "is being reviewed. You'll get access to wholesale pricing once it's approved.",

  // ── language switcher ──
  "lang.label": "Language",
} as const;

export type Key = keyof typeof en;

const ms: Record<Key, string> = {
  // ── header / navigation ──
  "nav.bestSellers": "Paling Laris",
  "nav.new": "Baharu",
  "nav.baby": "Bayi",
  "nav.offers": "Tawaran",
  "nav.myOrders": "Pesanan Saya",
  "nav.admin": "Admin",
  "nav.cart": "Troli",
  "nav.login": "Log Masuk",
  "nav.logout": "Log Keluar",
  "nav.apply": "Mohon",
  "nav.searchPlaceholder": "Apa yang anda cari?",
  "nav.shopAll": "Lihat Semua",

  // ── mega menu ──
  "menu.newbornShop": "Bayi Baru Lahir",
  "menu.toddlerShop": "Kanak-kanak Kecil",
  "menu.sleepwear": "Pakaian Tidur",
  "menu.daywear": "Pakaian Harian",
  "menu.byAge": "Ikut Umur",
  "menu.onesies": "Baju Romper",
  "menu.rompers": "Romper",
  "menu.threePacks": "Pek 3 Helai",
  "menu.dresses": "Gaun",
  "menu.hoodies": "Baju Berhud",
  "menu.overalls": "Jumpsuit",
  "menu.matchingSets": "Set Sepadan",
  "menu.allOffers": "Semua Tawaran",
  "menu.netTerms": "Terma Net 30",

  // ── categories ──
  "cat.Newborn": "Bayi Baru Lahir",
  "cat.Infants": "Bayi",
  "cat.Toddlers": "Kanak-kanak Kecil",
  "cat.Girls": "Perempuan",
  "cat.Boys": "Lelaki",

  // ── colourways (shared across styles — see `colour()`) ──
  "color.Butter": "Kuning Mentega",
  "color.Cloud White": "Putih Awan",
  "color.Soft Sage": "Hijau Sage Lembut",
  "color.Denim Blue": "Biru Denim",
  "color.Cherry Red": "Merah Ceri",
  "color.Blue Stripe": "Jalur Biru",
  "color.Pink Stripe": "Jalur Merah Jambu",
  "color.Beige": "Krim Kecoklatan",
  "color.Cocoa": "Coklat Koko",
  "color.Cream Floral": "Bunga Krim",
  "color.Pink Floral": "Bunga Merah Jambu",

  // ── fabric compositions (shared across styles — see `fabric()`) ──
  "fabric.100% cotton": "100% kapas",
  "fabric.100% cotton poplin": "100% poplin kapas",
  "fabric.Cotton denim": "Denim kapas",
  "fabric.95% cotton / 5% elastane rib": "95% kapas / 5% rib elastane",
  "fabric.80% cotton / 20% polyester fleece":
    "80% kapas / 20% bulu poliester",

  // ── product cards / ordering ──
  "product.colour": "Warna",
  "product.size": "Saiz",
  "product.sizeOrPack": "Saiz atau pek",
  "product.units": "Unit",
  "product.pack": "pek",
  "product.from": "Dari",
  "product.perUnit": "/unit",
  "product.moq": "Pesanan min.",
  "product.save": "jimat",
  "product.sizeLabel": "Saiz",

  // ── prepack names (shared across styles — see `packName()`) ──
  "packname.Standard prepack": "Pek sedia standard",

  // ── country selector in the footer ──
  "country.MY": "Malaysia (MYR RM)",
  "country.SG": "Singapura (MYR RM)",
  "country.BN": "Brunei (MYR RM)",
  "country.ID": "Indonesia (MYR RM)",
  "cart.add": "Tambah ke troli",
  "cart.added": "Telah ditambah ke troli anda.",
  "cart.view": "Lihat troli",

  // ── catalogue page ──
  "catalog.searchByCategory": "Cari mengikut kategori",
  "catalog.seeAllCategories": "Lihat semua kategori",
  "catalog.prepacks": "Pek Sedia",
  "catalog.bulkDeals": "Tawaran Pukal",
  "catalog.newArrivals": "Kemasukan Baharu",
  "catalog.bestSellers": "Paling Laris",
  "catalog.saveBig": "Jimat Besar",
  "catalog.ourBestDeals": "Tawaran terbaik kami",
  "catalog.bulkFavourites": "Kegemaran harga pukal",
  "catalog.shopAllDeals": "Lihat semua tawaran",
  "catalog.backToCatalogue": "← Kembali ke katalog",
  "catalog.allCategories": "← Semua kategori",
  "catalog.nothingYet": "Tiada apa-apa di sini buat masa ini!",
  "catalog.browseEverything": "Lihat semua produk",
  "catalog.noStylesInCategory": "Tiada gaya dalam kategori ini lagi!",
  "catalog.newIn": "Kemasukan Baharu",
  "catalog.newInSub": "Tambahan terkini kami, yang terbaharu dahulu",
  "catalog.saleTitle": "Jualan & Tawaran Pukal",
  "catalog.resultsFor": "Keputusan untuk",
  "catalog.stylesFound": "gaya dijumpai",
  "catalog.styleFound": "gaya dijumpai",
  "catalog.stylesWithSavings": "gaya dengan penjimatan harga pukal",
  "catalog.styles": "gaya",
  "catalog.style": "gaya",
  "catalog.categoryBlurb": "harga borong dengan potongan kuantiti automatik",
  "catalog.tagline": "Lembut pada kulit, mesra pada margin.",

  // ── hero slider ──
  "slider.specialOffer": "Tawaran istimewa",
  "slider.upTo": "Sehingga",
  "slider.offOn": "diskaun",
  "slider.bulkFrom": "Harga pukal bermula dari",
  "slider.unitsBestRate": "unit — kadar terbaik",
  "slider.moqJust": "Pesanan minimum hanya",
  "slider.shopThisDeal": "Beli tawaran ini",
  "slider.netTitle": "Terma pembayaran Net 30 untuk setiap pesanan",
  "slider.netSub":
    "Pesan hari ini, bayar dalam 30 hari — setiap pesanan menjana invois secara automatik. Tiada kad diperlukan semasa pembayaran.",
  "slider.howItWorks": "Cara ia berfungsi",

  // ── collection banner ──
  "banner.title": "Koleksi Harian",
  "banner.sub":
    "Warna dan corak yang digemari pelanggan anda — distok semula dalam kapas organik paling lembut.",
  "banner.cta": "Beli Kemasukan Baharu",

  // ── editorial panel ──
  "editorial.eyebrow": "Mengapa Pilih Tiny Threads",
  "editorial.title1": "Untuk Detik Kecil",
  "editorial.title2": "Yang Bermakna",
  "editorial.body":
    "Kami menyediakan pakaian bayi berkualiti tinggi, bergaya dan selesa pada harga borong. Koleksi kami direka dengan penuh kasih — memastikan si kecil selesa sambil membantu perniagaan anda berkembang.",
  "editorial.premium": "Kualiti Premium",
  "editorial.premiumSub": "Fabrik organik lembut & selamat",
  "editorial.trendy": "Reka Bentuk Terkini",
  "editorial.trendySub": "Bergaya untuk setiap musim",
  "editorial.pricing": "Harga Borong",
  "editorial.pricingSub": "Nilai lebih baik untuk perniagaan anda",
  "editorial.shipping": "Penghantaran Pantas & Dipercayai",
  "editorial.shippingSub": "Penghantaran tepat pada masanya, sentiasa",

  // ── why panel ──
  "why.eyebrow": "Mengapa TinyThreads?",
  "why.title": "Kerana setiap butik berhak mendapat stok semula yang mudah",
  "why.prepacks": "Pek saiz bercampur",
  "why.prepacksSub":
    "Setiap pek tiba dengan susunan saiz yang seimbang, jadi anda tidak terlebih beli satu saiz dan kehabisan saiz yang lain.",
  "why.terms": "Terma Net 30",
  "why.termsSub":
    "Pesan hari ini, bayar dalam 30 hari. Setiap pesanan menjana invois secara automatik — tiada kad semasa pembayaran.",
  "why.cotton": "Kapas diperakui GOTS",
  "why.cottonSub":
    "Fabrik organik diperakui yang lembut pada kulit bayi dan tahan lama selepas berkali-kali dibasuh.",
  "why.breaks": "Potongan kuantiti automatik",
  "why.breaksSub":
    "Harga menurun apabila pesanan anda bertambah — diskaun dikenakan sendiri di dalam troli.",

  // ── testimonials ──
  "testi.heading": "Jangan dengar daripada kami sahaja.",
  "testi.t1": "Wajib ada untuk butik",
  "testi.q1":
    "MOQ yang tidak menakutkan kedai kecil, dan kualitinya menjual dirinya sendiri. Pek sedia pertama kami habis dalam sembilan hari.",
  "testi.t2": "Kami suka TinyThreads!",
  "testi.q2":
    "Terma Net 30 mengubah aliran tunai kami sepenuhnya. Kami telah menambah stok tiga kali musim ini tanpa menggunakan kad.",
  "testi.t3": "Habis dijual dalam satu hujung minggu",
  "testi.q3":
    "Baju berhud beruang itu habis dalam satu hujung minggu. Kami pesan pek yang lebih besar dengan Net 30 — keputusan tambah stok paling mudah pernah kami buat.",
  "catalog.exploreAllDeals": "Terokai Semua Tawaran",

  // ── filter sidebar (baby listing) ──
  "filter.filterBy": "Tapis mengikut",
  "filter.availability": "Ketersediaan",
  "filter.inStock": "Ada stok",
  "filter.outOfStock": "Kehabisan stok",
  "filter.size": "Saiz",
  "filter.colour": "Warna",
  "filter.category": "Kategori",
  "filter.fabric": "Fabrik",
  "filter.products": "produk",
  "filter.product": "produk",
  "filter.sortBy": "Susun mengikut",
  "filter.featured": "Pilihan",
  "filter.priceLowHigh": "Harga: Rendah ke Tinggi",
  "filter.priceHighLow": "Harga: Tinggi ke Rendah",
  "filter.newest": "Terbaharu",
  "filter.noMatch": "Tiada produk yang sepadan dengan tapisan ini.",
  "filter.clearAll": "Kosongkan semua tapisan",

  // ── value props ──
  "value.prepacks": "Pek saiz bercampur",
  "value.prepacksSub": "Susunan saiz seimbang dalam setiap pek",
  "value.shipping": "Penghantaran percuma melebihi RM 2,000",
  "value.shippingSub": "Semenanjung & Malaysia Timur, dijejaki sepenuhnya",
  "value.exchanges": "Pertukaran 7 hari",
  "value.exchangesSub": "Tukar saiz atau gaya tanpa kerumitan",
  "value.terms": "Terma Net 30",
  "value.termsSub": "Pesan hari ini, bayar dalam 30 hari",

  // ── footer ──
  "footer.shop": "Beli",
  "footer.help": "Bantuan",
  "footer.about": "Tentang",
  "footer.newArrivals": "Kemasukan Baharu",
  "footer.bestSellers": "Paling Laris",
  "footer.sale": "Jualan",
  "footer.sizeGuide": "Panduan Saiz",
  "footer.shipping": "Maklumat Penghantaran",
  "footer.returns": "Pemulangan",
  "footer.faq": "Soalan Lazim",
  "footer.ourStory": "Kisah Kami",
  "footer.contact": "Hubungi Kami",
  "footer.becomePartner": "Jadi rakan niaga",
  "footer.shoppingFrom": "Saya membeli dari:",
  "footer.rights": "Hak cipta terpelihara.",

  // ── footer: link-card column headings ──
  "footer.customerService": "Khidmat Pelanggan",
  "footer.account": "Akaun",
  "footer.usefulLinks": "Pautan Berguna",
  "footer.moreGoodies": "Lagi Pilihan",
  "footer.partnerWithUs": "Jadi Rakan Niaga",

  // ── footer: link labels ──
  "footer.faqs": "Soalan Lazim",
  "footer.shippingPolicy": "Dasar Penghantaran",
  "footer.login": "Log Masuk",
  "footer.myOrders": "Pesanan Saya",
  "footer.myCart": "Troli Saya",
  "footer.applyWholesale": "Mohon Akaun Borong",
  "footer.fabricGuide": "Panduan Fabrik",
  "footer.pricingTiers": "Tahap Harga",
  "footer.bulkDeals": "Tawaran Pukal",
  "footer.seasonalSets": "Set Bermusim",
  "footer.whyOrganic": "Kenapa Kapas Organik",
  "footer.cares": "TinyThreads Cares",
  "footer.press": "Media",
  "footer.wholesale": "Borong",

  // ── footer: promo + newsletter ──
  "footer.promoTitle": "Buka harga borong untuk pesanan anda!",
  "footer.promoSub":
    "Jadi yang pertama tahu tentang koleksi baharu dan tawaran borong apabila anda membuka akaun borong.",
  "footer.consent":
    "Dengan memohon, anda bersetuju menerima e-mel pesanan dan pemasaran daripada TinyThreads (contohnya koleksi baharu, peringatan stok masuk). Kelulusan bukan syarat pembelian. Berhenti melanggan bila-bila masa melalui pautan dalam setiap e-mel.",
  "footer.privacyTerms": "Dasar Privasi & Terma",
  "footer.newsletterTitle": "Daftar untuk keluaran baharu + tawaran",
  "footer.newsletterSub":
    "Dapatkan akses awal kepada produk baharu dan promosi apabila anda melanggan surat berita kami.",
  "footer.emailPlaceholder": "Alamat E-mel Anda",
  "footer.subscribe": "Langgan",
  "footer.recaptchaBefore": "Laman ini dilindungi oleh reCAPTCHA dan",
  "footer.privacyPolicy": "Dasar Privasi",
  "footer.and": "serta",
  "footer.termsOfService": "Terma Perkhidmatan",
  "footer.recaptchaAfter": "Google terpakai.",

  // ── footer: side cards ──
  "footer.caresBody":
    "Setiap musim, kami berbangga menyumbang sebahagian daripada hasil kami kepada hospital kanak-kanak dan badan amal awal kanak-kanak melalui program TinyThreads Cares.",
  "footer.learnMore": "Ketahui Lagi",
  "footer.clubTitle": "Sertai Kelab Peruncit",
  "footer.clubBody":
    "Berkenalan, berkongsi tip jualan, jual dengan lebih baik. Semuanya dalam komuniti peribadi kami untuk pemilik butik.",
  "footer.joinNow": "Sertai Sekarang",

  // ── footer: bottom bar ──
  "footer.terms": "Terma & Syarat",
  "footer.privacy": "Privasi",
  "footer.accessibility": "Kebolehcapaian",

  // ── cart page ──
  "cart.title": "Troli anda",
  "cart.empty": "Troli kosong.",
  "cart.browse": "Lihat katalog",
  "cart.moqError":
    "Sebahagian gaya berada di bawah kuantiti pesanan minimum — lihat amaran di bawah.",
  "cart.unitsInCart": "unit dalam troli, pesanan minimum ialah",
  "cart.addMore": "Tambah",
  "cart.moreUnits": "unit lagi untuk memesan gaya ini.",
  "cart.item": "Barang",
  "cart.units": "Unit",
  "cart.unitPrice": "Harga seunit",
  "cart.total": "Jumlah",
  "cart.remove": "Buang",
  "cart.subtotal": "Jumlah kecil",
  "cart.pricesNote":
    "Harga seunit sudah termasuk potongan kuantiti anda. Penghantaran dan cukai ditambah pada invois jika berkenaan.",
  "cart.notes": "Nota pesanan (pilihan)",
  "cart.notesPlaceholder": "Arahan penghantaran, tarikh penghantaran diminta…",
  "cart.placeOrder": "Buat pesanan dengan terma Net 30",
  "cart.clear": "Kosongkan troli",
  "cart.invoiceNote":
    "Membuat pesanan akan menjana invois — tiada bayaran kad diambil sekarang.",

  // ── login / register / pending ──
  "auth.login": "Log Masuk",
  "auth.invalid": "E-mel atau kata laluan tidak sah.",
  "auth.email": "E-mel",
  "auth.password": "Kata laluan",
  "auth.noAccount": "Tiada akaun?",
  "auth.applyLink": "Mohon akaun perdagangan",
  "auth.haveAccount": "Sudah mempunyai akaun?",
  "auth.loginLink": "Log masuk",
  "auth.registerTitle": "Mohon akaun perdagangan",
  "auth.registerIntro":
    "Harga borong hanya kelihatan kepada perniagaan yang diluluskan. Kami menyemak setiap permohonan.",
  "auth.businessName": "Nama perniagaan",
  "auth.contactName": "Nama untuk dihubungi",
  "auth.phone": "Telefon",
  "auth.address": "Alamat perniagaan",
  "auth.taxId": "Nombor cukai / pendaftaran perniagaan",
  "auth.minChars": "(minimum 8 aksara)",
  "auth.submitApplication": "Hantar permohonan",
  "auth.emailTaken":
    "Akaun dengan e-mel itu sudah wujud — cuba log masuk.",
  "auth.fillRequired":
    "Sila isi semua medan yang diperlukan (kata laluan sekurang-kurangnya 8 aksara).",
  // ── orders list + invoice ──
  "orders.title": "Pesanan",
  "orders.none": "Tiada pesanan lagi.",
  "orders.order": "Pesanan",
  "orders.date": "Tarikh",
  "orders.status": "Status",
  "orders.invoice": "Invois",
  "orders.total": "Jumlah",
  "orders.allOrders": "← Semua pesanan",
  "orders.placed":
    "Pesanan dibuat! Invois anda di bawah — kami akan mengesahkan pesanan sebentar lagi.",
  "orders.issued": "Dikeluarkan",
  "orders.due": "Tarikh akhir",
  "orders.terms": "Terma",
  "orders.paid": "TELAH DIBAYAR",
  "orders.unpaid": "BELUM DIBAYAR",
  "orders.billTo": "Bil kepada",
  "orders.description": "Keterangan",
  "orders.units": "Unit",
  "orders.unitPrice": "Harga seunit",
  "orders.amount": "Amaun",
  "orders.totalDue": "Jumlah perlu dibayar",
  "orders.notes": "Nota pesanan:",
  "orders.paymentTerms":
    "Bayaran perlu dijelaskan dalam tempoh 30 hari dari tarikh dikeluarkan. Sila rujuk",
  "orders.withPayment": "bersama bayaran anda.",
  "orders.print": "Cetak / simpan sebagai PDF",

  // ── status badges (order, invoice and buyer statuses) ──
  "status.PENDING": "MENUNGGU",
  "status.CONFIRMED": "DISAHKAN",
  "status.SHIPPED": "DIHANTAR",
  "status.CANCELLED": "DIBATALKAN",
  "status.APPROVED": "DILULUSKAN",
  "status.REJECTED": "DITOLAK",
  "status.UNPAID": "BELUM DIBAYAR",
  "status.PAID": "TELAH DIBAYAR",

  "pending.rejectedTitle": "Permohonan tidak diluluskan",
  "pending.rejectedBody":
    "Malangnya permohonan akaun perdagangan anda tidak diluluskan. Hubungi kami jika anda rasa ini satu kesilapan.",
  "pending.title": "Permohonan diterima ✓",
  "pending.thanks": "Terima kasih",
  "pending.applicationFor": "Permohonan anda untuk",
  "pending.underReview":
    "sedang disemak. Anda akan mendapat akses kepada harga borong setelah ia diluluskan.",

  // ── language switcher ──
  "lang.label": "Bahasa",
};

const dictionaries: Record<Lang, Record<Key, string>> = { en, ms };

export const LANG_COOKIE = "lang";

/** Look up a translated string. */
export function t(lang: Lang, key: Key): string {
  return dictionaries[lang][key];
}

/**
 * Translate a value that came out of the database against a dictionary prefix.
 *
 * Categories, colours and fabrics are a controlled vocabulary shared across
 * products, so they live in the dictionary rather than in per-row columns —
 * one translation of "Cloud White" serves every style that uses it. A value
 * with no entry (one an admin adds later) is returned unchanged, so the page
 * shows the real word rather than a missing-translation placeholder.
 */
function term(lang: Lang, prefix: string, value: string): string {
  const key = `${prefix}.${value}` as Key;
  return key in dictionaries[lang] ? dictionaries[lang][key] : value;
}

/** Translate a category name coming from the database. */
export function category(lang: Lang, name: string): string {
  return term(lang, "cat", name);
}

/** Translate a colourway name coming from the database. */
export function colour(lang: Lang, name: string): string {
  return term(lang, "color", name);
}

/** Translate a fabric composition coming from the database. */
export function fabric(lang: Lang, name: string): string {
  return term(lang, "fabric", name);
}

/** Translate a prepack's name coming from the database. */
export function packName(lang: Lang, name: string): string {
  return term(lang, "packname", name);
}

/**
 * Pick a product's name and description for the current language.
 *
 * Unlike the vocabularies above, this reads the per-product `nameMs` /
 * `descriptionMs` columns. Either may be null — a style added through the
 * admin before anyone has translated it — so both fall back to the English,
 * which is always populated. A buyer never sees a blank product name.
 */
export function productCopy<
  T extends {
    name: string;
    description?: string | null;
    nameMs?: string | null;
    descriptionMs?: string | null;
  }
>(lang: Lang, p: T): { name: string; description: string | null } {
  if (lang === "ms") {
    return {
      name: p.nameMs || p.name,
      description: p.descriptionMs || p.description || null,
    };
  }
  return { name: p.name, description: p.description ?? null };
}
