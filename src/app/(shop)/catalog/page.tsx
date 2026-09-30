import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { lowestPrice, packLabel, packUnits } from "@/lib/pricing";
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
import { Reveal } from "@/components/ui/Reveal";
import { PicotEdge } from "@/components/ui/Decor";
import { addToCart } from "@/app/actions/cart";
// aliased: this page already has a `category` variable for the active filter
import {
  t,
  category as categoryName,
  colour as colourName,
  productCopy,
  type Lang,
} from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

type ProductWithExtras = Awaited<ReturnType<typeof getProducts>>[number];

function getProducts(where: object, orderBy: object = { name: "asc" }) {
  return prisma.product.findMany({
    where: { active: true, ...where },
    include: { priceBreaks: true, variants: true, packs: true },
    orderBy,
  });
}

/**
 * Product card with ordering built in.
 *
 * Buyers pick colour, size and quantity and add to the cart without leaving
 * the grid — a wholesale buyer restocking twenty styles should not have to
 * open twenty pages. The product name and photo still link through to the
 * detail page for prepacks, the full price-break table and fabric notes.
 *
 * The form posts to the `addToCart` server action, so it works with no
 * client-side JavaScript. Quantity defaults to the product's MOQ, since any
 * smaller amount would be rejected at checkout anyway.
 */
function ProductCard({ p, returnTo, lang }: { p: ProductWithExtras; returnTo: string; lang: Lang }) {
  const low = lowestPrice(p.basePrice, p.priceBreaks);
  const img = productImage(p.styleCode);
  const pct = bulkDiscountPct(p.basePrice, p.priceBreaks);
  const copy = productCopy(lang, p);
  // The option *value* stays the stored colour — that is what the cart action
  // matches against — while only the visible label is translated.
  const colors = [...new Set(p.variants.map((v) => v.color))];
  const sizes = [...new Set(p.variants.map((v) => v.size))];

  return (
    <div className="tilt-card group relative flex flex-col rounded-[1.75rem] border-2 border-transparent bg-white p-2.5 shadow-[0_2px_12px_rgba(186,146,96,0.18)] hover:border-[#E0B064] hover:shadow-[0_18px_38px_rgba(186,146,96,0.5)]">
      {/* Everything a buyer needs is on the card now, so there is no separate
          product page to link through to. */}
      <div
        className="relative block h-56 overflow-hidden rounded-[1.4rem]"
        style={{ backgroundColor: categoryTileBg(p.category) }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={copy.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl transition duration-500 group-hover:scale-110">
            {categoryEmoji(p.category)}
          </div>
        )}

        {pct > 0 && (
          <span className="absolute left-2.5 top-2.5 -rotate-6 rounded-full bg-[#F27D9D] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
            {t(lang, "product.save")} {pct}% ✨
          </span>
        )}
      </div>

      <div className="px-2 pt-3">
        <div className="font-baloo text-[16px] font-bold leading-snug text-ink">
          {copy.name}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold text-stone-400">
          {categoryName(lang, p.category)} · {p.styleCode}
        </div>
        <div className="mt-1.5 text-sm font-bold text-ink">
          {t(lang, "product.from")} {money(low)}{" "}
          <span className="font-medium text-stone-400">
            {t(lang, "product.perUnit")} · {t(lang, "product.moq")} {p.moq}
          </span>
        </div>
      </div>

      {/* order straight from the grid */}
      <form action={addToCart} className="mt-3 px-2 pb-1">
        <input type="hidden" name="productId" value={p.id} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor={`color-${p.id}`}>
            {t(lang, "product.colour")}
          </label>
          <select
            id={`color-${p.id}`}
            name="color"
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none focus:border-[#E0B064]"
          >
            {colors.map((c) => (
              <option key={c} value={c}>
                {colourName(lang, c)}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor={`size-${p.id}`}>
            {t(lang, "product.sizeOrPack")}
          </label>
          {/*
            One dropdown covers both ways of buying. Prepack options carry a
            "pack:<id>" value which the form splits out below, so a buyer can
            order a balanced size run without leaving the grid.
          */}
          <select
            id={`size-${p.id}`}
            name="size"
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none focus:border-[#E0B064]"
          >
            {p.packs.map((pk) => (
              <option key={pk.id} value={`pack:${pk.id}`}>
                {packLabel(pk.contents)} {t(lang, "product.pack")} (
                {packUnits(pk.contents)})
              </option>
            ))}
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex gap-2">
          <label className="sr-only" htmlFor={`qty-${p.id}`}>
            {t(lang, "product.units")}
          </label>
          <input
            id={`qty-${p.id}`}
            name="qty"
            type="number"
            min={1}
            step={1}
            defaultValue={p.moq}
            aria-label={`${t(lang, "product.units")} — ${copy.name}`}
            className="w-16 shrink-0 rounded-lg border border-stone-200 bg-white px-2 py-2 text-center text-xs font-bold text-ink outline-none focus:border-[#E0B064]"
          />
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FAF3E9] py-2 text-xs font-bold text-ink transition hover:bg-[#E0B064] hover:text-[#5C3D16]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2.2L7.5 15h10L20 7H6.4" />
              <circle cx="9" cy="19.5" r="1.4" />
              <circle cx="17" cy="19.5" r="1.4" />
            </svg>
            {t(lang, "cart.add")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Grid({
  items,
  returnTo = "/catalog",
  lang,
}: {
  items: ProductWithExtras[];
  /** Where "Add to cart" returns the buyer to, so they stay in the grid. */
  returnTo?: string;
  lang: Lang;
}) {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} returnTo={returnTo} lang={lang} />
      ))}
    </div>
  );
}

/** Friendly placeholder so a filter with no matches never feels like an error. */
function EmptyState({ message, lang }: { message: string; lang: Lang }) {
  return (
    <div className="flex flex-col items-center rounded-[1.75rem] bg-[#FAF3E9] px-6 py-14 text-center">
      <span className="text-5xl" aria-hidden>
        🧸
      </span>
      <p className="mt-3 font-baloo text-lg font-bold text-ink">{message}</p>
      <Link
        href="/catalog"
        className="mt-4 rounded-full bg-[#E0B064] px-5 py-2.5 text-sm font-bold text-[#5C3D16] transition hover:brightness-95"
      >
        {t(lang, "catalog.browseEverything")}
      </Link>
    </div>
  );
}

function ListView({
  title,
  sub,
  items,
  lang,
}: {
  title: string;
  sub: string;
  items: ProductWithExtras[];
  lang: Lang;
}) {
  return (
    <div>
      <Link
        href="/catalog"
        className="text-sm font-bold text-stone-400 hover:text-brand"
      >
        {t(lang, "catalog.backToCatalogue")}
      </Link>
      <h1 className="mt-2 font-baloo text-3xl font-bold text-ink">{title}</h1>
      <p className="mb-6 mt-1 text-sm text-stone-500">{sub}</p>
      {items.length > 0 ? (
        <Grid items={items} lang={lang} />
      ) : (
        <EmptyState message={t(lang, "catalog.nothingYet")} lang={lang} />
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
  const lang = await getLang();
  const justAdded = query.added === "1";

  if (q) {
    const results = await getProducts({
      // Both names are searched regardless of the active language, so a term
      // in either one finds the style.
      OR: [
        { name: { contains: q } },
        { nameMs: { contains: q } },
        { styleCode: { contains: q } },
        { category: { contains: q } },
        { fabric: { contains: q } },
      ],
    });
    return (
      <ListView
        title={`${t(lang, "catalog.resultsFor")} “${q}”`}
        sub={`${results.length} ${t(
          lang,
          results.length === 1 ? "catalog.styleFound" : "catalog.stylesFound"
        )}`}
        items={results}
        lang={lang}
      />
    );
  }

  if (sort === "new") {
    const items = await getProducts({}, { createdAt: "desc" });
    return (
      <ListView
        title={t(lang, "catalog.newIn")}
        sub={t(lang, "catalog.newInSub")}
        items={items}
        lang={lang}
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
        title={t(lang, "catalog.saleTitle")}
        sub={`${items.length} ${t(lang, "catalog.stylesWithSavings")}`}
        items={items}
        lang={lang}
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
          {t(lang, "catalog.allCategories")}
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
              {categoryName(lang, category)}
            </h1>
            <p className="text-sm text-stone-500">
              {items.length}{" "}
              {items.length === 1
                ? t(lang, "catalog.style")
                : t(lang, "catalog.styles")}{" "}
              · {t(lang, "catalog.categoryBlurb")}
            </p>
          </div>
        </div>
        {items.length > 0 ? (
          <Grid items={items} lang={lang} />
        ) : (
          <EmptyState message={t(lang, "catalog.noStylesInCategory")} lang={lang} />
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
  const tints = ["#F4E9D8", "#FDE7ED", "#FDF3DC"];
  const slides: OfferSlide[] = discounted.map(({ p, pct }, i) => {
    const minBreak = [...p.priceBreaks].sort((a, b) => a.minQty - b.minQty)[0];
    return {
      // Built from fragments rather than one sentence key, because the numbers
      // sit between the words and each language orders them the same way here.
      title: `${t(lang, "slider.upTo")} ${pct}% ${t(lang, "slider.offOn")} ${
        productCopy(lang, p).name
      }`,
      sub:
        `${t(lang, "slider.bulkFrom")} ${minBreak.minQty}+ ` +
        `${t(lang, "slider.unitsBestRate")} ` +
        `${money(lowestPrice(p.basePrice, p.priceBreaks))}${t(lang, "product.perUnit")}. ` +
        `${t(lang, "slider.moqJust")} ${p.moq}.`,
      cta: t(lang, "slider.shopThisDeal"),
      href: "/catalog?deals=1",
      img: productImage(p.styleCode),
      tint: tints[i % tints.length],
    };
  });
  slides.push({
    title: t(lang, "slider.netTitle"),
    sub: t(lang, "slider.netSub"),
    cta: t(lang, "slider.howItWorks"),
    href: "/#how",
    // A lifestyle shot rather than a product cut-out: this slide is about the
    // trading relationship, not one style. Deliberately not one of the three
    // product photos above it, so the carousel doesn't repeat itself.
    img: "/images/loved.jpg",
    imgPos: "50% 28%", // favour the top so the faces aren't cropped
    tint: "#FAF3E9",
  });

  const dealProducts = flashItems.map((x) => x.p).slice(0, 4);
  const tprod = (code: string) => {
    const p = products.find((x) => x.styleCode === code);
    return p
      ? {
          name: productCopy(lang, p).name,
          price: `${t(lang, "product.from")} ${money(
            lowestPrice(p.basePrice, p.priceBreaks)
          )} ${t(lang, "product.perUnit")}`,
          img: productImage(p.styleCode),
          href: "/catalog?deals=1",
        }
      : {
          name: t(lang, "catalog.browseEverything"),
          price: t(lang, "catalog.categoryBlurb"),
          img: null,
          href: "/catalog",
        };
  };

  return (
    <div className="relative space-y-16 pb-4">
      {justAdded && (
        <div className="rounded-xl bg-[#E7F3EA] px-4 py-3 text-sm font-semibold text-[#2F6B45]">
          Added to your cart.{" "}
          <Link href="/cart" className="underline">
            {t(lang, "cart.view")}
          </Link>
        </div>
      )}
      {/* ── Hero — contained photo slider ── */}
      <Reveal variant="zoom" className="above-decor">
      <section>
        <OffersSlider slides={slides} eyebrow={t(lang, "slider.specialOffer")} />
      </section>
      </Reveal>

      {/* ── Search by category ──
          A flat, frameless grid: every category the catalogue actually has,
          followed by the shortcuts buyers ask for most. Deliberately plain so
          it scans quickly — this is a directory, not a feature panel. */}
      <Reveal variant="rise" className="above-decor">
      <section>
        <h2 className="mb-8 text-2xl font-bold text-ink md:text-[1.7rem]">
          {t(lang, "catalog.searchByCategory")}
        </h2>

        <div className="grid grid-cols-3 gap-x-4 gap-y-9 sm:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => {
            const img = categoryImage(c);
            return (
              <Link
                key={c}
                href={`/catalog?category=${encodeURIComponent(c)}`}
                className="group flex flex-col items-center text-center"
              >
                <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl">{categoryEmoji(c)}</span>
                  )}
                </span>
                <span className="mt-3 text-sm font-medium leading-snug text-ink transition group-hover:opacity-60">
                  {categoryName(lang, c)}
                </span>
              </Link>
            );
          })}

          {/* Shortcut tiles — drawn as flat graphic marks rather than photos,
              so they read as navigation rather than as another product. */}
          {[
            { label: t(lang, "catalog.prepacks"), href: "/catalog", mark: "PACK", bg: "#F1EDE6", fg: "#5C5348" },
            { label: t(lang, "catalog.bulkDeals"), href: "/catalog?deals=1", mark: "SAVE", bg: "#E0B064", fg: "#4A3210" },
            { label: t(lang, "catalog.newArrivals"), href: "/catalog?sort=new", mark: "NEW", bg: "#FFFFFF", fg: "#2B2620", outline: true },
            // `tile`, not `t` — `t` is the translation function and shadowing
            // it here would break any lookup added inside this block later.
          ].map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group flex flex-col items-center text-center"
            >
              <span
                className={`flex h-24 w-24 items-center justify-center rounded-2xl text-sm font-extrabold tracking-wide transition duration-300 group-hover:-translate-y-1 ${
                  tile.outline ? "border-2 border-ink/80" : "shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
                }`}
                style={{ background: tile.bg, color: tile.fg }}
              >
                {tile.mark}
              </span>
              <span className="mt-3 text-sm font-medium leading-snug text-ink transition group-hover:opacity-60">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/catalog"
            className="rounded-full border border-ink/70 px-16 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-ink transition hover:bg-ink hover:text-white"
          >
            {t(lang, "catalog.seeAllCategories")}
          </Link>
        </div>
      </section>
      </Reveal>

      {/* ── Best Sellers with tabs + tagline ── */}
      <Reveal variant="rise" className="above-decor">
      <section>
        <Tabs
          heading={t(lang, "catalog.bestSellers")}
          tagline={t(lang, "catalog.tagline")}
          labels={[t(lang, "catalog.bestSellers"), t(lang, "catalog.newArrivals"), t(lang, "catalog.saveBig")]}
        >
          <Grid items={[...products].sort((a, b) => a.moq - b.moq)} lang={lang} />
          <Grid
            items={[...products].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            )}
            lang={lang}
          />
          <Grid items={flashItems.map((x) => x.p)} lang={lang} />
        </Tabs>
        <div className="mt-10 text-center">
          <Link
            href="/catalog?sort=new"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-9 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            {t(lang, "nav.shopAll")} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
      </Reveal>

      {/* ── Full-bleed collection banner ── */}
      <Reveal variant="zoom" className="above-decor">
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
              {t(lang, "banner.title")}
            </h2>
            <p className="mt-2 max-w-md text-white/85">
              {t(lang, "banner.sub")}
            </p>
            <Link
              href="/catalog?sort=new"
              className="mt-5 rounded-lg bg-white px-7 py-3 text-sm font-bold text-ink transition hover:bg-stone-100"
            >
              {t(lang, "banner.cta")}
            </Link>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── Editorial split — photo + feature grid card ── */}
      <Reveal variant="tilt" className="above-decor">
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
              {t(lang, "editorial.eyebrow")}
            </div>
            <h2 className="mt-2 font-baloo text-3xl font-extrabold leading-tight text-ink md:text-[2.4rem]">
              {t(lang, "editorial.title1")} <br className="hidden md:block" />
              {t(lang, "editorial.title2")}{" "}
              <span aria-hidden="true" style={{ color: "#F27D9D" }}>
                ♥
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-500">
              {t(lang, "editorial.body")}
            </p>

            <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                { icon: "shield", t: t(lang, "editorial.premium"), s: t(lang, "editorial.premiumSub"), bg: "#FFF0D6", fg: "#E0960A" },
                { icon: "dress", t: t(lang, "editorial.trendy"), s: t(lang, "editorial.trendySub"), bg: "#FDE7ED", fg: "#F27D9D" },
                { icon: "pay", t: t(lang, "editorial.pricing"), s: t(lang, "editorial.pricingSub"), bg: "#FCE4EF", fg: "#E8688C" },
                { icon: "truck", t: t(lang, "editorial.shipping"), s: t(lang, "editorial.shippingSub"), bg: "#F3E8D7", fg: "#C08F3E" },
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
      </Reveal>

      {/* ── Why TinyThreads ── */}
      <Reveal variant="left" className="above-decor">
      <section>
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
          {t(lang, "why.eyebrow")}
        </div>
        <h2 className="max-w-xl font-baloo text-3xl font-extrabold text-ink">
          {t(lang, "why.title")}
        </h2>
        <div className="mt-10 grid gap-x-16 gap-y-8 md:grid-cols-2">
          {[
            { icon: "box", t: t(lang, "why.prepacks"), s: t(lang, "why.prepacksSub") },
            { icon: "pay", t: t(lang, "why.terms"), s: t(lang, "why.termsSub") },
            { icon: "shield", t: t(lang, "why.cotton"), s: t(lang, "why.cottonSub") },
            { icon: "check", t: t(lang, "why.breaks"), s: t(lang, "why.breaksSub") },
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
      </Reveal>

      {/* ── Deals band (cream, full-bleed) ── */}
      <Reveal variant="rise" className="above-decor">
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F6ECDC]">
        <PicotEdge color="#FFFFFF" flip />
        <div className="mx-auto max-w-[1440px] px-4 py-14 md:px-8">
          <div className="text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
            {t(lang, "catalog.ourBestDeals")}
          </div>
          <h2 className="mt-1 text-center font-baloo text-3xl font-extrabold text-ink">
            {t(lang, "catalog.bulkFavourites")}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dealProducts.map((p) => (
              <ProductCard key={p.id} p={p} returnTo="/catalog" lang={lang} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/catalog?deals=1"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-9 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              {t(lang, "catalog.exploreAllDeals")} <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── Testimonials (Kyte-style carousel, contained) ── */}
      <Reveal variant="rise" className="above-decor">
      <section>
        <h2 className="mb-10 text-center font-baloo text-3xl font-extrabold text-ink md:text-4xl">
          {t(lang, "testi.heading")}
        </h2>
        {/* The `who` lines stay as written — they are people and shop names,
            not copy to translate. */}
        <TestimonialCarousel
          items={[
            {
              img: "/images/loved.jpg",
              title: t(lang, "testi.t1"),
              quote: t(lang, "testi.q1"),
              who: "Mia — Little Fern Boutique",
              product: tprod("BNEW-601"),
            },
            {
              img: "/images/product-dress.jpg",
              title: t(lang, "testi.t2"),
              quote: t(lang, "testi.q2"),
              who: "Priya — Sprout & Co.",
              product: tprod("BDRS-101"),
            },
            {
              img: "/images/look.jpg",
              title: t(lang, "testi.t3"),
              quote: t(lang, "testi.q3"),
              who: "Hannah — Acorn Kids",
              product: tprod("BHOD-201"),
            },
          ]}
        />
      </section>
      </Reveal>
    </div>
  );
}
