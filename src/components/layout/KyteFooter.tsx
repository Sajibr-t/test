import Link from "next/link";

/* Kyte-style shop footer: cream ground, promo + newsletter row,
   white link-card panels, circular "cares" badge, bottom utility bar */

const LINK_COLS: { heading: string; links: [string, string][] }[][] = [
  [
    {
      heading: "Customer Service",
      links: [
        ["FAQs", "/#how"],
        ["Contact Us", "/register"],
        ["Returns", "/#how"],
        ["Shipping Policy", "/#how"],
      ],
    },
    {
      heading: "Account",
      links: [
        ["Login", "/login"],
        ["My Orders", "/orders"],
        ["My Cart", "/cart"],
        ["Apply for Wholesale", "/register"],
      ],
    },
    {
      heading: "Useful Links",
      links: [
        ["Size Guide", "/catalog"],
        ["Fabric Guide", "/catalog"],
        ["Pricing Tiers", "/#pricing"],
      ],
    },
  ],
  [
    {
      heading: "More Goodies",
      links: [
        ["New Arrivals", "/catalog?sort=new"],
        ["Bulk Deals", "/catalog?deals=1"],
        ["Best Sellers", "/catalog"],
        ["Seasonal Sets", "/catalog?q=set"],
      ],
    },
    {
      heading: "About",
      links: [
        ["Our Story", "/"],
        ["Why Organic Cotton", "/#how"],
        ["TinyThreads Cares", "/#how"],
        ["Press", "/"],
      ],
    },
    {
      heading: "Partner With Us",
      links: [["Wholesale", "/register"]],
    },
  ],
];

function CircularBadge() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute -right-6 -top-10 h-28 w-28 -rotate-12 text-ink"
      aria-hidden
    >
      <defs>
        <path id="badge-circle" d="M60,60 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
      <text fontSize="13" fontWeight="700" letterSpacing="3" fill="currentColor">
        <textPath href="#badge-circle">TINY THREADS · TINY THREADS ·</textPath>
      </text>
      <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fontStyle="italic" fill="currentColor">
        cares
      </text>
    </svg>
  );
}

export default function KyteFooter() {
  return (
    <footer className="bg-[#F3F9FE] print:hidden">
      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-14 md:px-10">
        {/* top row: brand + promo + newsletter */}
        <div className="grid gap-10 lg:grid-cols-[260px_1fr_1fr] lg:gap-14">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍼</span>
              <span className="font-baloo text-2xl font-extrabold text-ink">
                Tiny Threads
              </span>
            </Link>
            <div className="mt-5 flex items-center gap-5 text-ink">
              {/* Facebook */}
              <span className="cursor-pointer transition hover:opacity-60" title="Facebook">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              {/* Instagram */}
              <span className="cursor-pointer transition hover:opacity-60" title="Instagram">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </span>
              {/* Pinterest */}
              <span className="cursor-pointer transition hover:opacity-60" title="Pinterest">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
              </span>
              {/* TikTok */}
              <span className="cursor-pointer transition hover:opacity-60" title="TikTok">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink">
              📦 Unlock trade pricing on your order!
            </div>
            <p className="mt-2 text-sm text-ink/80">
              Be first to know about new drops + trade deals when you open a
              wholesale account.
            </p>
            <Link
              href="/register"
              className="mt-4 inline-block rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink"
            >
              Apply for Wholesale
            </Link>
            <p className="mt-4 max-w-md text-[11px] leading-relaxed text-ink/60">
              By applying, you consent to receive order and marketing emails
              from TinyThreads (e.g. new collections, restock reminders).
              Approval is not a condition of purchase. Unsubscribe at any time
              via the link in every email.{" "}
              <Link href="/#how" className="underline">Privacy Policy &amp; Terms</Link>.
            </p>
          </div>

          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink">
              ✉️ Sign up for new releases + deals
            </div>
            <p className="mt-2 text-sm text-ink/80">
              Get insider access to new products and promotions when you
              subscribe to our newsletter.
            </p>
            <form action="/register" className="mt-4 flex max-w-md">
              <input
                name="email"
                type="email"
                placeholder="Your Email Address"
                className="w-full rounded-l-lg border border-r-0 border-stone-300 bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400"
              />
              <button className="rounded-r-lg border border-stone-300 bg-white px-5 text-sm font-bold text-ink transition hover:bg-stone-100">
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-[11px] text-ink/60">
              This site is protected by reCAPTCHA and the Google{" "}
              <Link href="/#how" className="underline">Privacy Policy</Link> and{" "}
              <Link href="/#how" className="underline">Terms of Service</Link> apply.
            </p>
          </div>
        </div>

        {/* middle: link cards + side cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.9fr_1fr]">
          <div className="rounded-xl bg-white p-8 md:p-10">
            <div className="space-y-10">
              {LINK_COLS.map((row, i) => (
                <div key={i} className="grid gap-8 sm:grid-cols-3">
                  {row.map((col) => (
                    <div key={col.heading}>
                      <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
                        {col.heading}
                      </div>
                      <ul className="space-y-2.5">
                        {col.links.map(([label, href]) => (
                          <li key={label}>
                            <Link
                              href={href}
                              className="text-sm text-ink/70 transition hover:text-ink"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative rounded-xl bg-white p-8">
              <CircularBadge />
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
                🧸 TinyThreads Cares
              </div>
              <p className="mt-3 max-w-[85%] text-sm leading-relaxed text-ink/70">
                Every season, we are proud to donate a portion of our proceeds
                to children&apos;s hospitals and early-childhood charities
                through the TinyThreads Cares program.
              </p>
              <Link
                href="/#how"
                className="mt-4 inline-block rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink"
              >
                Learn More
              </Link>
            </div>
            <div className="rounded-xl bg-white p-8">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink">
                🤝 Join the Retailer Club
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Make friends, swap merchandising tips, sell better. It&apos;s
                all inside our private community for boutique owners.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-block rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-ink/70">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              © TinyThreads {new Date().getFullYear()}. All rights reserved.
            </span>
            <Link href="/#how" className="underline hover:text-ink">T&apos;s &amp; C&apos;s</Link>
            <Link href="/#how" className="underline hover:text-ink">Privacy</Link>
            <Link href="/#how" className="underline hover:text-ink">Accessibility</Link>
          </div>
          <label className="flex items-center gap-3">
            <span>I&apos;m shopping from:</span>
            <select
              defaultValue="US"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-ink outline-none"
            >
              <option value="US">United States (USD $)</option>
              <option value="BD">Bangladesh (USD $)</option>
              <option value="UK">United Kingdom (USD $)</option>
              <option value="EU">Europe (USD $)</option>
            </select>
          </label>
        </div>
      </div>
    </footer>
  );
}
