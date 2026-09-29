import Link from "next/link";
import KyteFooter from "@/components/layout/KyteFooter";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { getUser } from "@/lib/session";
import { readCart } from "@/lib/cart";
import { logout } from "@/app/actions/auth";

const NAV_MENUS = [
  {
    label: "Offers",
    href: "/catalog?deals=1",
    items: [
      { label: "All Offers", href: "/catalog?deals=1" },
      { label: "Bulk Deals", href: "/catalog?deals=1" },
      { label: "New Arrivals", href: "/catalog?sort=new" },
      { label: "Net 30 Terms", href: "/#how" },
    ],
  },
];

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cart] = await Promise.all([getUser(), readCart()]);
  const approved =
    !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      {/* announcement bar */}
      <div className="bg-[#E3F5FE] print:hidden">
        <div className="mx-auto max-w-[1440px] px-4 py-2 text-center text-xs font-bold text-ink">
          Net 30 terms on every order — order today, pay in 30 days
        </div>
      </div>

      {/* utility row */}
      <div className="border-b border-stone-200/70 bg-[#FFFCF8] print:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-end gap-5 px-4 py-1.5 text-[11px] font-semibold text-stone-500">
          <Link href="/register" className="hover:text-ink">Become a partner</Link>
          <Link href="/#how" className="hover:text-ink">Help</Link>
          {approved && (
            <Link href="/orders" className="hover:text-ink">My Orders</Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-ink">Admin</Link>
          )}
        </div>
      </div>

      {/* main bar (sticky) */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white print:hidden">
        <div className="relative mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-7 gap-y-2 px-4 py-3.5 md:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="text-xl">🍼</span>
            <span className="font-baloo text-xl font-extrabold text-ink">
              Tiny Threads
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-[15px] font-semibold text-ink">
            <Link href="/catalog" className="transition hover:opacity-60">
              Best Sellers
            </Link>
            <Link href="/catalog?sort=new" className="transition hover:opacity-60">
              New
            </Link>
            {/* Baby mega menu (full-width panel, Kyte-style) */}
            <div className="group static -my-3.5 py-3.5">
              <Link
                href="/baby"
                className="flex items-center gap-1 transition group-hover:underline group-hover:underline-offset-8"
              >
                Baby
                <svg viewBox="0 0 24 24" className="h-3 w-3 transition group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9 L12 15 L18 9" />
                </svg>
              </Link>
              <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="border-t border-stone-100 bg-white px-10 py-10 shadow-lg">
                  <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[220px_220px_1fr_1fr_1fr]">
                    {[
                      { img: "/images/product-onesie.jpg", label: "Newborn Shop", href: "/catalog?category=Newborn" },
                      { img: "/images/product-hoodie.jpg", label: "Toddler Shop", href: "/catalog?category=Toddlers" },
                    ].map((card) => (
                      <Link key={card.label} href={card.href} className="block">
                        <span className="block h-56 overflow-hidden rounded-lg bg-[#E7F2FB]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={card.img} alt="" className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]" />
                        </span>
                        <span className="mt-3 block text-center font-bold text-ink">
                          {card.label}
                        </span>
                      </Link>
                    ))}
                    {[
                      {
                        heading: "Sleepwear",
                        links: [
                          ["Onesies", "/catalog?q=onesie"],
                          ["Rompers", "/catalog?q=romper"],
                          ["3-Packs", "/catalog?q=pack"],
                        ],
                        all: "/catalog?category=Newborn",
                      },
                      {
                        heading: "Daywear",
                        links: [
                          ["Dresses", "/catalog?q=dress"],
                          ["Hoodies", "/catalog?q=hoodie"],
                          ["Overalls", "/catalog?q=overall"],
                          ["Matching Sets", "/catalog?q=set"],
                        ],
                        all: "/catalog",
                      },
                      {
                        heading: "By Age",
                        links: [
                          ["Newborn", "/catalog?category=Newborn"],
                          ["Infants", "/catalog?category=Infants"],
                          ["Toddlers", "/catalog?category=Toddlers"],
                          ["Girls", "/catalog?category=Girls"],
                          ["Boys", "/catalog?category=Boys"],
                        ],
                        all: "/catalog",
                      },
                    ].map((col) => (
                      <div key={col.heading}>
                        <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.15em] text-ink">
                          {col.heading}
                        </div>
                        <ul className="space-y-2.5">
                          {col.links.map(([label, href]) => (
                            <li key={label}>
                              <Link href={href} className="text-[15px] font-medium text-ink transition hover:opacity-60">
                                {label}
                              </Link>
                            </li>
                          ))}
                          <li className="pt-1">
                            <Link href={col.all} className="text-[15px] font-bold text-ink transition hover:opacity-60">
                              Shop All
                            </Link>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {NAV_MENUS.map((menu) => (
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
                        className="block px-5 py-2 text-sm font-medium text-ink transition hover:bg-[#F3F9FE]"
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
              placeholder="What are you looking for?"
              className="w-full rounded-full bg-[#F3F9FE] py-2.5 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-stone-400"
            />
          </form>

          <div className="flex shrink-0 items-center gap-3 text-sm">
            {approved && (
              <Link
                href="/cart"
                className="relative rounded-full border border-stone-200 px-4 py-2 font-bold text-ink transition hover:border-ink"
              >
                Cart
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            )}
            {user ? (
              <form action={logout}>
                <button className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90">
                  Log out
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-semibold text-stone-500 transition hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                >
                  Apply
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8">
        {children}
      </main>

      {/* value props (Kyte-style row above the footer) */}
      <section className="border-t border-stone-200 bg-[#F3F9FE] print:hidden">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "box", t: "Size-run prepacks", s: "Balanced size curves in every pack" },
            { icon: "truck", t: "Free shipping over $2,000", s: "Worldwide and fully tracked" },
            { icon: "return", t: "7-day exchanges", s: "Swap sizes or styles hassle-free" },
            { icon: "pay", t: "Net 30 terms", s: "Order today, pay in 30 days" },
          ].map((f) => (
            <div key={f.t} className="flex flex-col items-center gap-2 text-center">
              <span className="text-stone-500">
                <FeatureIcon kind={f.icon} />
              </span>
              <div className="text-sm font-bold text-ink">{f.t}</div>
              <div className="text-xs text-stone-500">{f.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Kyte-style shop footer */}
      <KyteFooter />
    </>
  );
}
