import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { lowestPrice } from "@/lib/pricing";
import {
  categoryEmoji,
  categoryImage,
  productImage,
  categoryTileBg,
  bulkDiscountPct,
} from "@/lib/display";
import OffersSlider, { type OfferSlide } from "@/components/shop/OffersSlider";
import Tabs from "@/components/shop/Tabs";
import { FeatureIcon, GarmentIcon } from "@/components/ui/FeatureIcon";
import TestimonialCarousel from "@/components/shop/TestimonialCarousel";

type ProductWithExtras = Awaited<ReturnType<typeof getProducts>>[number];

function getProducts(where: object, orderBy: object = { name: "asc" }) {
  return prisma.product.findMany({
    where: { active: true, ...where },
    include: { priceBreaks: true, variants: true },
    orderBy,
  });
}

/* Serif heading with side rules, like the reference */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full bg-[#F48FB1]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" />
      <h2 className="whitespace-nowrap font-baloo text-2xl font-extrabold text-ink md:text-3xl">
        {children}
      </h2>
      <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#92DBFD]" />
    </div>
  );
}

/* Kyte-style card: photo on warm off-white, plain type, "Select a Pack +" quick bar */
function ProductCard({ p }: { p: ProductWithExtras }) {
  const low = lowestPrice(p.basePrice, p.priceBreaks);
  const img = productImage(p.styleCode);
  return (
    <Link
      href={`/catalog/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white transition hover:shadow-md"
    >
      <div className="h-72 overflow-hidden bg-[#E7F2FB]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={p.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {categoryEmoji(p.category)}
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        <div className="text-[15px] font-bold leading-snug text-ink">
          {p.name}
        </div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wide text-stone-400">
          {p.category} · {p.styleCode}
        </div>
        <div className="mt-2 text-sm font-semibold text-ink">
          From {money(low)}{" "}
          <span className="font-normal text-stone-400">
            /unit · MOQ {p.moq}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-stone-200/80 px-4 py-3 text-sm font-bold text-ink">
        Select a Pack
        <span className="text-lg leading-none" aria-hidden>
          +
        </span>
      </div>
    </Link>
  );
}

function Grid({ items }: { items: ProductWithExtras[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

function ListView({
  title,
  sub,
  items,
}: {
  title: string;
  sub: string;
  items: ProductWithExtras[];
}) {
  return (
    <div>
      <Link
        href="/catalog"
        className="text-sm font-bold text-stone-400 hover:text-brand"
      >
        ← Back to catalogue
      </Link>
      <h1 className="mt-2 font-baloo text-3xl font-bold text-ink">{title}</h1>
      <p className="mb-6 mt-1 text-sm text-stone-500">{sub}</p>
      {items.length > 0 ? (
        <Grid items={items} />
      ) : (
        <p className="py-10 text-stone-500">
          Nothing here yet —{" "}
          <Link href="/catalog" className="font-bold text-brand underline">
            browse everything
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const category = typeof query.category === "string" ? query.category : "";
  const sort = typeof query.sort === "string" ? query.sort : "";
  const deals = query.deals === "1";

  if (q) {
    const results = await getProducts({
      OR: [
        { name: { contains: q } },
        { styleCode: { contains: q } },
        { category: { contains: q } },
        { fabric: { contains: q } },
      ],
    });
    return (
      <ListView
        title={`Results for “${q}”`}
        sub={`${results.length} style${results.length === 1 ? "" : "s"} found`}
        items={results}
      />
    );
  }

  if (sort === "new") {
    const items = await getProducts({}, { createdAt: "desc" });
    return (
      <ListView
        title="New In"
        sub="Our latest additions, newest first"
        items={items}
      />
    );
  }

  if (deals) {
    const all = await getProducts({});
    const items = all.filter(
      (p) => bulkDiscountPct(p.basePrice, p.priceBreaks) > 0
    );
    return (
      <ListView
        title="Sale & Bulk Deals"
        sub={`${items.length} style${items.length === 1 ? "" : "s"} with quantity-break savings`}
        items={items}
      />
    );
  }

  if (category) {
    const items = await getProducts({ category });
    const img = categoryImage(category);
    return (
      <div>
        <Link
          href="/catalog"
          className="text-sm font-bold text-stone-400 hover:text-brand"
        >
          ← All categories
        </Link>
        <div className="mb-6 mt-3 flex items-center gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-3xl"
            style={{ backgroundColor: categoryTileBg(category) }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="h-full w-full object-cover" />
            ) : (
              categoryEmoji(category)
            )}
          </span>
          <div>
            <h1 className="font-baloo text-3xl font-bold text-ink">
              {category}
            </h1>
            <p className="text-sm text-stone-500">
              {items.length} style{items.length === 1 ? "" : "s"} · wholesale
              pricing with automatic quantity breaks
            </p>
          </div>
        </div>
        {items.length > 0 ? (
          <Grid items={items} />
        ) : (
          <p className="py-10 text-stone-500">No styles in this category yet.</p>
        )}
      </div>
    );
  }

  /* ── Catalogue home ── */
  const products = await getProducts({});
  const categories = [...new Set(products.map((p) => p.category))];
  const flashItems = products
    .map((p) => ({ p, pct: bulkDiscountPct(p.basePrice, p.priceBreaks) }))
    .filter((x) => x.pct > 0)
    .sort((a, b) => b.pct - a.pct);
  const discounted = flashItems.slice(0, 3);
  const tints = ["#E3F5FE", "#FDE7ED", "#FDF3DC"];
  const slides: OfferSlide[] = discounted.map(({ p, pct }, i) => {
    const minBreak = [...p.priceBreaks].sort((a, b) => a.minQty - b.minQty)[0];
    return {
      title: `Up to ${pct}% off ${p.name}`,
      sub: `Bulk pricing kicks in from ${minBreak.minQty}+ units — best rate ${money(lowestPrice(p.basePrice, p.priceBreaks))}/unit. MOQ just ${p.moq}.`,
      cta: "Shop this deal",
      href: `/catalog/${p.id}`,
      img: productImage(p.styleCode),
      tint: tints[i % tints.length],
    };
  });
  slides.push({
    title: "Net 30 payment terms on every order",
    sub: "Order today, pay in 30 days — every order automatically generates an invoice. No card needed at checkout.",
    cta: "How it works",
    href: "/#how",
    img: null,
    tint: "#F3F9FE",
  });

  const trio = categories.slice(0, 3);
  const trioCaption = (c: string) => {
    if (/newborn/i.test(c)) return "For baby's first moments";
    if (/toddler/i.test(c)) return "Built for busy little legs";
    if (/girl/i.test(c)) return "Twirl-tested favourites";
    if (/boy/i.test(c)) return "Everyday adventure-ready";
    if (/infant/i.test(c)) return "Soft everyday essentials";
    return "Wholesale-ready essentials";
  };
  const garmentFor = (c: string) => {
    if (/newborn|infant/i.test(c)) return "onesie";
    if (/girl/i.test(c)) return "dress";
    if (/boy/i.test(c)) return "cap";
    if (/toddler/i.test(c)) return "tshirt";
    return "onesie";
  };
  const dealProducts = flashItems.map((x) => x.p).slice(0, 4);
  const tprod = (code: string) => {
    const p = products.find((x) => x.styleCode === code);
    return p
      ? {
          name: p.name,
          price: `From ${money(lowestPrice(p.basePrice, p.priceBreaks))} /unit`,
          img: productImage(p.styleCode),
          href: `/catalog/${p.id}`,
        }
      : {
          name: "Browse the catalogue",
          price: "Wholesale pricing",
          img: null,
          href: "/catalog",
        };
  };

  return (
    <div className="space-y-16 pb-4">
      {/* ── Hero — contained photo slider ── */}
      <section>
        <OffersSlider slides={slides} />
      </section>

      {/* ── Most-loved trio ── */}
      <section className="grid gap-5 md:grid-cols-3">
        {trio.map((c) => {
          const img = categoryImage(c);
          return (
            <Link
              key={c}
              href={`/catalog?category=${encodeURIComponent(c)}`}
              className="group overflow-hidden rounded-xl border border-stone-200/80 bg-white transition hover:shadow-md"
            >
              <div className="h-80 overflow-hidden bg-[#E7F2FB]">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">{categoryEmoji(c)}</div>
                )}
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-ink">{c}</div>
                <div className="mt-3 flex items-center gap-3 text-stone-500">
                  <GarmentIcon kind={garmentFor(c)} />
                  <span className="text-sm">{trioCaption(c)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* ── Best Sellers with tabs + tagline ── */}
      <section>
        <Tabs
          heading="Best Sellers"
          tagline="Soft on skin, easy on margins."
          labels={["Best Seller", "New Arrivals", "Save Big"]}
        >
          <Grid items={[...products].sort((a, b) => a.moq - b.moq)} />
          <Grid
            items={[...products].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            )}
          />
          <Grid items={flashItems.map((x) => x.p)} />
        </Tabs>
        <div className="mt-10 text-center">
          <Link
            href="/catalog?sort=new"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-9 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            Shop All <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ── Full-bleed collection banner ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2">
        <div className="relative h-[280px] overflow-hidden md:h-[420px] lg:h-[480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/banner-adventures.jpg"
            alt="Smiling toddler in a blue knit jumper among clouds and stars"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 22%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-[1440px] flex-col items-start justify-center px-6 md:px-8">
            <h2 className="font-baloo text-4xl font-extrabold text-white md:text-5xl">
              The Everyday Collection
            </h2>
            <p className="mt-2 max-w-md text-white/85">
              The colours and prints your customers love — restocked in the
              softest organic cotton.
            </p>
            <Link
              href="/catalog?sort=new"
              className="mt-5 rounded-lg bg-white px-7 py-3 text-sm font-bold text-ink transition hover:bg-stone-100"
            >
              Shop New In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Editorial split — photo + feature grid card ── */}
      <section
        className="relative overflow-hidden rounded-[2rem] p-5 md:p-8"
        style={{
          background:
            "radial-gradient(ellipse 45% 65% at 3% 18%, #FDE7ED 0%, transparent 62%), radial-gradient(ellipse 38% 55% at 99% 82%, #FDE7ED 0%, transparent 58%), #FFFBF7",
        }}
      >
        <div className="grid items-center gap-7 md:grid-cols-[minmax(0,42%)_1fr] md:gap-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/figma/hero.jpg"
            alt="Little girl in a floral dress with her teddy bear"
            className="aspect-[4/3.4] w-full rounded-2xl object-cover"
          />

          {/* content */}
          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#E0A83B" }}
            >
              Why Choose Tiny Threads
            </div>
            <h2 className="mt-2 font-baloo text-3xl font-extrabold leading-tight text-ink md:text-[2.4rem]">
              For Little Moments <br className="hidden md:block" />
              That Matter{" "}
              <span aria-hidden="true" style={{ color: "#F27D9D" }}>
                ♥
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-500">
              We provide high-quality, stylish and comfortable baby clothing at
              wholesale prices. Our collections are designed with love — keeping
              little ones cosy while helping your business grow.
            </p>

            <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                { icon: "shield", t: "Premium Quality", s: "Soft & safe organic fabrics", bg: "#FFF0D6", fg: "#E0960A" },
                { icon: "dress", t: "Trendy Designs", s: "Stylish for every season", bg: "#FDE7ED", fg: "#F27D9D" },
                { icon: "pay", t: "Wholesale Pricing", s: "Better value for your business", bg: "#FCE4EF", fg: "#E8688C" },
                { icon: "truck", t: "Fast & Reliable Shipping", s: "On-time delivery, always", bg: "#E3F0FC", fg: "#3FA9DD" },
              ].map((f) => (
                <div key={f.t} className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: f.bg, color: f.fg }}
                  >
                    {f.icon === "dress" ? (
                      <GarmentIcon kind="dress" />
                    ) : (
                      <FeatureIcon kind={f.icon} />
                    )}
                  </span>
                  <div className="pt-0.5">
                    <div className="font-baloo text-[15px] font-bold text-ink">
                      {f.t}
                    </div>
                    <p className="text-xs leading-relaxed text-stone-500">
                      {f.s}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why TinyThreads ── */}
      <section>
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
          Why TinyThreads?
        </div>
        <h2 className="max-w-xl font-baloo text-3xl font-extrabold text-ink">
          Because every boutique deserves an easy restock
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
          {[
            { icon: "box", t: "Size-run prepacks", s: "Every pack arrives as a balanced size curve, so you never over-buy one size and sell out of another." },
            { icon: "pay", t: "Net 30 terms", s: "Order today, pay in 30 days. Every order generates an invoice automatically — no card at checkout." },
            { icon: "shield", t: "GOTS-certified cotton", s: "Certified organic fabric that is gentle on newborn skin and holds up wash after wash." },
            { icon: "check", t: "Automatic quantity breaks", s: "Prices step down as your order grows — discounts apply themselves right in the cart." },
          ].map((f) => (
            <div key={f.t} className="flex gap-4">
              <span className="shrink-0 text-stone-500">
                <FeatureIcon kind={f.icon} />
              </span>
              <div>
                <div className="font-bold text-ink">{f.t}</div>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">{f.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deals band (cream, full-bleed) ── */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F3F9FE]">
        <div className="mx-auto max-w-[1440px] px-4 py-14 md:px-8">
          <div className="text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
            Our best deals
          </div>
          <h2 className="mt-1 text-center font-baloo text-3xl font-extrabold text-ink">
            Bulk-price favourites
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dealProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/catalog?deals=1"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-9 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Explore All Deals <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials (Kyte-style carousel, contained) ── */}
      <section>
        <h2 className="mb-10 text-center font-baloo text-3xl font-extrabold text-ink md:text-4xl">
          Don&apos;t just hear it from us.
        </h2>
        <TestimonialCarousel
          items={[
            {
              img: "/images/loved.jpg",
              title: "A must for boutiques",
              quote:
                "MOQs that don't scare a small shop, and the quality sells itself. Our first prepack sold through in nine days.",
              who: "Mia — Little Fern Boutique",
              product: tprod("BNEW-601"),
            },
            {
              img: "/images/product-dress.jpg",
              title: "We love TinyThreads!",
              quote:
                "Net 30 terms changed our cash flow completely. We've restocked three times this season without touching a card.",
              who: "Priya — Sprout & Co.",
              product: tprod("BDRS-101"),
            },
            {
              img: "/images/look.jpg",
              title: "Sold through in a weekend",
              quote:
                "The bear hoodies were gone in one weekend. Reordered the bigger pack on Net 30 — easiest restock decision we've made.",
              who: "Hannah — Acorn Kids",
              product: tprod("BHOD-201"),
            },
          ]}
        />
      </section>
    </div>
  );
}