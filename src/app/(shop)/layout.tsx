import Link from "next/link";
import KyteFooter from "@/components/layout/KyteFooter";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { getUser } from "@/lib/session";
import { readCart } from "@/lib/cart";
import { logout } from "@/app/actions/auth";
import { t, type Key, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

/**
 * Menus are built per-request rather than declared as a module constant,
 * because every label has to come out of the dictionary for the language the
 * visitor picked. Labels are dictionary *keys*, resolved at render time.
 */
function navMenus(lang: Lang) {
  return [
    {
      label: t(lang, "nav.offers"),
      href: "/catalog?deals=1",
      items: [
        { label: t(lang, "menu.allOffers"), href: "/catalog?deals=1" },
        { label: t(lang, "catalog.bulkDeals"), href: "/catalog?deals=1" },
        { label: t(lang, "catalog.newArrivals"), href: "/catalog?sort=new" },
        { label: t(lang, "menu.netTerms"), href: "/#how" },
      ],
    },
  ];
}

/** Image cards at the left of the Baby mega menu. */
const MEGA_CARDS: { img: string; key: Key; href: string }[] = [
  { img: "/images/product-onesie.jpg", key: "menu.newbornShop", href: "/catalog?category=Newborn" },
  { img: "/images/product-hoodie.jpg", key: "menu.toddlerShop", href: "/catalog?category=Toddlers" },
];

/**
 * Link columns of the Baby mega menu. Both the heading and every link label
 * are dictionary keys — the age column reuses the `cat.*` keys so the menu and
 * the category tiles on the catalogue always read the same.
 */
const MEGA_COLUMNS: { heading: Key; links: [Key, string][]; all: string }[] = [
  {
    heading: "menu.sleepwear",
    links: [
      ["menu.onesies", "/catalog?q=onesie"],
      ["menu.rompers", "/catalog?q=romper"],
      ["menu.threePacks", "/catalog?q=pack"],
    ],
    all: "/catalog?category=Newborn",
  },
  {
    heading: "menu.daywear",
    links: [
      ["menu.dresses", "/catalog?q=dress"],
      ["menu.hoodies", "/catalog?q=hoodie"],
      ["menu.overalls", "/catalog?q=overall"],
      ["menu.matchingSets", "/catalog?q=set"],
    ],
    all: "/catalog",
  },
  {
    heading: "menu.byAge",
    links: [
      ["cat.Newborn", "/catalog?category=Newborn"],
      ["cat.Infants", "/catalog?category=Infants"],
      ["cat.Toddlers", "/catalog?category=Toddlers"],
      ["cat.Girls", "/catalog?category=Girls"],
      ["cat.Boys", "/catalog?category=Boys"],
    ],
    all: "/catalog",
  },
];

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cart, lang] = await Promise.all([getUser(), readCart(), getLang()]);
  const approved =
    !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      {/* Main bar — a floating pill.
          `sticky` (not `fixed`) means it starts in normal flow, then detaches
          and rides along once you scroll. The frosted background keeps content
          legible as it passes underneath. */}
      <header className="sticky top-3 z-40 px-3 pt-3 print:hidden md:px-5">
        <div className="relative mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-7 gap-y-2 rounded-[2rem] border border-white/70 bg-white/85 px-5 py-3 shadow-[0_10px_34px_rgba(186,146,96,0.28)] backdrop-blur-xl md:px-7">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-xl">🍼</span>
            <span className="font-baloo text-xl font-extrabold text-ink">
              Tiny Threads
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-[15px] font-semibold text-ink">
            <Link href="/catalog" className="transition hover:opacity-60">
              {t(lang, "nav.bestSellers")}
            </Link>
            <Link href="/catalog?sort=new" className="transition hover:opacity-60">
              {t(lang, "nav.new")}
            </Link>
            {/* Baby mega menu (full-width panel, Kyte-style) */}
            <div className="group static -my-3.5 py-3.5">
              <Link
                href="/baby"
                className="flex items-center gap-1 transition group-hover:underline group-hover:underline-offset-8"
              >
                {t(lang, "nav.baby")}
                <svg viewBox="0 0 24 24" className="h-3 w-3 transition group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9 L12 15 L18 9" />
                </svg>
              </Link>
              <div className="invisible absolute inset-x-0 top-full z-50 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                {/* rounded to match the floating bar it drops from */}
                <div className="rounded-[1.75rem] border border-stone-100 bg-white px-10 py-10 shadow-[0_18px_50px_rgba(186,146,96,0.32)]">
                  <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[220px_220px_1fr_1fr_1fr]">
                    {MEGA_CARDS.map((card) => (
                      <Link key={card.key} href={card.href} className="block">
                        <span className="block h-56 overflow-hidden rounded-lg bg-[#F1E5D3]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={card.img} alt="" className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]" />
                        </span>
                        <span className="mt-3 block text-center font-bold text-ink">
                          {t(lang, card.key)}
                        </span>
                      </Link>
                    ))}
                    {MEGA_COLUMNS.map((col) => (
                      <div key={col.heading}>
                        <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-ink">
                          {t(lang, col.heading)}
                        </div>
                        <ul className="space-y-2.5">
                          {col.links.map(([key, href]) => (
                            <li key={key}>
                              <Link href={href} className="text-[15px] font-medium text-ink transition hover:opacity-60">
                                {t(lang, key)}
                              </Link>
                            </li>
                          ))}
                          <li className="pt-1">
                            <Link href={col.all} className="text-[15px] font-bold text-ink transition hover:opacity-60">
                              {t(lang, "nav.shopAll")}
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {navMenus(lang).map((menu) => (
              <div key={menu.label} className="group relative">
                <Link
                  href={menu.href}
                  className="flex items-center gap-1 transition group-hover:opacity-60"
                >
                  {menu.label}
                  <svg viewBox="0 0 24 24" className="h-3 w-3 transition group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9 L12 15 L18 9" />
                  </svg>
                </Link>
                {/* transparent bridge keeps hover alive over the bar padding */}
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-[15px] opacity-0 transition group-hover:visible group-hover:opacity-100">
                  <div className="w-60 rounded-xl border border-stone-100 bg-white py-3 shadow-lg">
                    {menu.items.map((it) => (
                      <Link
                        key={it.label}
                        href={it.href}
                        className="block px-5 py-2 text-sm font-medium text-ink transition hover:bg-[#FAF3E9]"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* search */}
          <form
            action="/catalog"
            className="relative order-last w-full flex-1 md:order-none md:ml-auto md:w-auto md:max-w-sm"
          >
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              name="q"
              placeholder={t(lang, "nav.searchPlaceholder")}
              className="w-full rounded-full bg-[#FAF3E9] py-2.5 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-stone-400"
            />
          </form>

          <div className="flex shrink-0 items-center gap-3 text-sm">
            {/* Language toggle sits with the account controls, where people
                expect to find it. */}
            <LanguageSwitcher lang={lang} />
            {/* Moved here from the old utility row above the header, so
                signed-in buyers and admins keep these routes. */}
            {approved && (
              <Link
                href="/orders"
                className="hidden font-semibold text-stone-500 transition hover:text-ink lg:block"
              >
                {t(lang, "nav.myOrders")}
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden font-semibold text-stone-500 transition hover:text-ink lg:block"
              >
                {t(lang, "nav.admin")}
              </Link>
            )}
            {approved && (
              <Link
                href="/cart"
                className="relative rounded-full border border-stone-200 px-4 py-2 font-bold text-ink transition hover:border-ink"
              >
                {t(lang, "nav.cart")}
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            )}
            {user ? (
              <form action={logout}>
                <button className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90">
                  {t(lang, "nav.logout")}
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-semibold text-stone-500 transition hover:text-ink"
                >
                  {t(lang, "nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                >
                  {t(lang, "nav.apply")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Three-tone ground: a soft sage band at the very top, a warm off-white
          below it, settling into white behind the content — so the page has
          depth without any colour competing with the product photography. */}
      <main className="flex-1 bg-gradient-to-b from-[#F8F4F1] via-[#FCFAF8] to-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8">{children}</div>
      </main>

      {/* value props (Kyte-style row above the footer) */}
      <section className="border-t border-stone-200 bg-[#FAF3E9] print:hidden">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "box", title: t(lang, "value.prepacks"), sub: t(lang, "value.prepacksSub") },
            { icon: "truck", title: t(lang, "value.shipping"), sub: t(lang, "value.shippingSub") },
            { icon: "return", title: t(lang, "value.exchanges"), sub: t(lang, "value.exchangesSub") },
            { icon: "pay", title: t(lang, "value.terms"), sub: t(lang, "value.termsSub") },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center">
              <span className="text-stone-500">
                <FeatureIcon kind={f.icon} />
              </span>
              <div className="text-sm font-bold text-ink">{f.title}</div>
              <div className="text-xs text-stone-500">{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kyte-style shop footer */}
      <KyteFooter lang={lang} />
    </>
  );
}
