import Link from "next/link";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { packLabel, packUnits } from "@/lib/pricing";
import { categoryEmoji, categoryTileBg, productImage } from "@/lib/display";
import { addToCart } from "@/app/actions/cart";
import {
  t,
  category as categoryName,
  colour as colourName,
  fabric as fabricName,
  productCopy,
  type Key,
  type Lang,
} from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";

type Filters = {
  q: string;
  stock: string;
  size: string;
  color: string;
  category: string;
  fabric: string;
  sort: string;
};

/** Sort options as [query value, dictionary key] — labels resolve per language. */
const SORTS: [string, Key][] = [
  ["featured", "filter.featured"],
  ["price-asc", "filter.priceLowHigh"],
  ["price-desc", "filter.priceHighLow"],
  ["newest", "filter.newest"],
];

function href(f: Filters, patch: Partial<Filters>): string {
  const merged = { ...f, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v && !(k === "sort" && v === "featured")) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/baby?${qs}` : "/baby";
}

// Toggle link: clicking an active value clears it
function toggleHref(f: Filters, key: keyof Filters, value: string): string {
  return href(f, { [key]: f[key] === value ? "" : value });
}

function FilterGroup({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-t border-stone-200 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg font-normal text-stone-400 group-open:hidden">+</span>
        <span className="hidden text-lg font-normal text-stone-400 group-open:inline">−</span>
      </summary>
      <div className="mt-3 space-y-2.5">{children}</div>
    </details>
  );
}

function CheckRow({
  active,
  label,
  count,
  to,
}: {
  active: boolean;
  label: string;
  count?: number;
  to: string;
}) {
  return (
    <Link href={to} className="flex items-center gap-2.5 text-sm text-ink/80 hover:text-ink">
      <span
        className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
          active ? "border-brand bg-brand text-white" : "border-stone-300 bg-white"
        }`}
      >
        {active && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13 L10 18 L19 7" />
          </svg>
        )}
      </span>
      {label}
      {count !== undefined && <span className="text-stone-400">({count})</span>}
    </Link>
  );
}

export default async function BabyShopPage({
  searchParams,
}: PageProps<"/baby">) {
  const query = await searchParams;
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  const f: Filters = {
    q: s(query.q).trim(),
    stock: s(query.stock),
    size: s(query.size),
    color: s(query.color),
    category: s(query.category),
    fabric: s(query.fabric),
    sort: s(query.sort) || "featured",
  };

  const all = await prisma.product.findMany({
    where: { active: true },
    include: { priceBreaks: true, variants: true, packs: true },
    orderBy: { createdAt: "desc" },
  });

  const fabricLabel = (fabric: string | null) =>
    fabric ? fabric.split(",")[0].trim() : null;
  const inStock = (p: (typeof all)[number]) =>
    p.variants.some((v) => v.stock > 0);

  // Facet values with counts (over the full catalog)
  const count = <T,>(vals: T[]) => {
    const m = new Map<T, number>();
    for (const v of vals) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()];
  };
  const sizeFacets = count(
    all.flatMap((p) => [...new Set(p.variants.map((v) => v.size))])
  );
  const colorFacets = count(
    all.flatMap((p) => [...new Set(p.variants.map((v) => v.color))])
  );
  const categoryFacets = count(all.map((p) => p.category));
  const fabricFacets = count(
    all.map((p) => fabricLabel(p.fabric)).filter((x): x is string => !!x)
  );
  const inStockCount = all.filter(inStock).length;

  // Apply filters
  let products = all.filter((p) => {
    if (f.stock === "in" && !inStock(p)) return false;
    if (f.stock === "out" && inStock(p)) return false;
    if (f.size && !p.variants.some((v) => v.size === f.size)) return false;
    if (f.color && !p.variants.some((v) => v.color === f.color)) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.fabric && fabricLabel(p.fabric) !== f.fabric) return false;
    if (f.q) {
      // Both names are searched regardless of the active language, so a term
      // in either one finds the style.
      const hay =
        `${p.name} ${p.nameMs ?? ""} ${p.styleCode} ${p.category} ${p.fabric ?? ""}`.toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  });

  if (f.sort === "price-asc") products = [...products].sort((a, b) => a.basePrice - b.basePrice);
  else if (f.sort === "price-desc") products = [...products].sort((a, b) => b.basePrice - a.basePrice);
  // "featured" and "newest" both keep createdAt desc from the query

  const lang: Lang = await getLang();

  // Size, colour and fabric chips echo the shopper's own filter value, which
  // is product data — only the stock state and the category have translations.
  const activeChips: { label: string; to: string }[] = [
    f.stock && {
      label: t(lang, f.stock === "in" ? "filter.inStock" : "filter.outOfStock"),
      to: href(f, { stock: "" }),
    },
    f.size && { label: f.size, to: href(f, { size: "" }) },
    f.color && { label: colourName(lang, f.color), to: href(f, { color: "" }) },
    f.category && { label: categoryName(lang, f.category), to: href(f, { category: "" }) },
    f.fabric && { label: fabricName(lang, f.fabric), to: href(f, { fabric: "" }) },
    f.q && { label: `“${f.q}”`, to: href(f, { q: "" }) },
  ].filter(Boolean) as { label: string; to: string }[];

  const sortKey = SORTS.find(([k]) => k === f.sort)?.[1] ?? "filter.featured";
  const sortLabel = t(lang, sortKey);
  const justAdded = s(query.added) === "1";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {justAdded && (
        <div className="mb-6 rounded-xl bg-[#E7F3EA] px-4 py-3 text-sm font-semibold text-[#2F6B45]">
          {t(lang, "cart.added")}{" "}
          <Link href="/cart" className="underline">
            {t(lang, "cart.view")}
          </Link>
        </div>
      )}
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* ── Filter sidebar ── */}
        <aside>
          <h1 className="font-baloo text-2xl font-bold text-ink">{t(lang, "filter.filterBy")}</h1>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.to}
                  className="flex items-center gap-1.5 rounded-md bg-[#FAF3E9] px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#F4E9D8]"
                >
                  ✕ {chip.label}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5">
            <FilterGroup title={t(lang, "filter.availability")} defaultOpen>
              <CheckRow
                active={f.stock === "in"}
                label={t(lang, "filter.inStock")}
                count={inStockCount}
                to={toggleHref(f, "stock", "in")}
              />
              <CheckRow
                active={f.stock === "out"}
                label={t(lang, "filter.outOfStock")}
                count={all.length - inStockCount}
                to={toggleHref(f, "stock", "out")}
              />
            </FilterGroup>

            <FilterGroup title={t(lang, "filter.size")} defaultOpen={!!f.size}>
              {sizeFacets.map(([size, n]) => (
                <CheckRow
                  key={size}
                  active={f.size === size}
                  label={size}
                  count={n}
                  to={toggleHref(f, "size", size)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={t(lang, "filter.colour")} defaultOpen={!!f.color}>
              {colorFacets.map(([color, n]) => (
                <CheckRow
                  key={color}
                  active={f.color === color}
                  label={colourName(lang, color)}
                  count={n}
                  to={toggleHref(f, "color", color)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={t(lang, "filter.category")} defaultOpen={!!f.category}>
              {categoryFacets.map(([category, n]) => (
                <CheckRow
                  key={category}
                  active={f.category === category}
                  label={categoryName(lang, category)}
                  count={n}
                  to={toggleHref(f, "category", category)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={t(lang, "filter.fabric")} defaultOpen={!!f.fabric}>
              {fabricFacets.map(([fabric, n]) => (
                <CheckRow
                  key={fabric}
                  active={f.fabric === fabric}
                  label={fabricName(lang, fabric)}
                  count={n}
                  to={toggleHref(f, "fabric", fabric)}
                />
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand">
              {products.length}{" "}
              {t(
                lang,
                products.length === 1 ? "filter.product" : "filter.products"
              )}
            </span>
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm text-ink [&::-webkit-details-marker]:hidden">
                <span className="text-stone-400">{t(lang, "filter.sortBy")}</span>
                <span className="font-semibold">{sortLabel}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 9 L12 15 L18 9" />
                </svg>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                {SORTS.map(([value, labelKey]) => (
                  <Link
                    key={value}
                    href={href(f, { sort: value })}
                    className={`block px-4 py-2 text-sm hover:bg-[#FAF3E9] ${
                      f.sort === value ? "font-semibold text-brand" : "text-ink"
                    }`}
                  >
                    {t(lang, labelKey)}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
            {products.map((p) => {
              const img = productImage(p.styleCode);
              const copy = productCopy(lang, p);
              // Option *values* stay the stored colour so the cart action can
              // match them; only the visible label is translated.
              const colors = [...new Set(p.variants.map((v) => v.color))];
              const sizes = [...new Set(p.variants.map((v) => v.size))];
              // Preserve the buyer's filters so adding to the cart doesn't
              // throw away the listing they had narrowed down.
              const backHere = href(f, {});
              return (
                <div key={p.id} className="group">
                  <div className="block">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[#F1E5D3]">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={copy.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center text-6xl"
                          style={{ backgroundColor: categoryTileBg(p.category) }}
                        >
                          {categoryEmoji(p.category)}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-ink">
                      {copy.name}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-ink/70">
                    {money(p.basePrice)}{" "}
                    <span className="text-stone-400">
                      {t(lang, "product.perUnit")} · {t(lang, "product.moq")}{" "}
                      {p.moq}
                    </span>
                  </div>

                  {/* order without opening the product page */}
                  <form action={addToCart} className="mt-2.5">
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="returnTo" value={backHere} />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="color"
                        aria-label={`${t(lang, "product.colour")} — ${copy.name}`}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink outline-none focus:border-[#E0B064]"
                      >
                        {colors.map((c) => (
                          <option key={c} value={c}>
                            {colourName(lang, c)}
                          </option>
                        ))}
                      </select>
                      {/* Prepacks first, then loose sizes. Pack options carry
                          a "pack:<id>" value the server action splits out. */}
                      <select
                        name="size"
                        aria-label={`${t(lang, "product.sizeOrPack")} — ${copy.name}`}
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
                      <input
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
            })}
          </div>

          {products.length === 0 && (
            <p className="py-16 text-center text-stone-500">
              {t(lang, "filter.noMatch")}{" "}
              <Link href="/baby" className="text-brand underline">
                {t(lang, "filter.clearAll")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
