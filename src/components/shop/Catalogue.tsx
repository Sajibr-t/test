import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import ShopHeroSlider from "./ShopHeroSlider";
import FilterPanel from "./FilterPanel";
import { BearMark, RainbowDoodle } from "./ShopDoodles";
import { categoryEmoji } from "@/lib/display";
import { getShopProducts, shopProduct } from "@/lib/shop-products";
import { getUser } from "@/lib/session";
import { getLang } from "@/lib/i18n-server";
import { readCart, priceCart } from "@/lib/cart";
import { shopCopy } from "@/lib/shop-copy";
import { category, colour, fabric as fabricName } from "@/lib/i18n";
import { money } from "@/lib/format";
import { lowestPrice } from "@/lib/pricing";

export type ShopQuery = Record<string, string | string[] | undefined>;

export default async function Catalogue({ query, path }: { query: ShopQuery; path: "/catalog" | "/baby" }) {
  const [all, user, lang, cart] = await Promise.all([getShopProducts(), getUser(), getLang(), readCart()]);
  const c = shopCopy(lang);
  const approved = !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  const priced = approved ? await priceCart(cart, lang) : null;
  const value = (key: string) => typeof query[key] === "string" ? query[key].trim() : "";
  const filters = { q: value("q"), category: value("category"), color: value("color"), size: value("size"), fabric: value("fabric"), stock: value("stock"), min: approved ? value("min") : "", max: approved ? value("max") : "", deals: value("deals") === "1" ? "1" : "", sort: value("sort") || "newest" };
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
  const link = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k); }
    return `${path}${next.size ? `?${next}` : ""}`;
  };
  const categories = [...new Set(all.map(p => p.category))].sort();
  const colors = [...new Set(all.flatMap(p => p.variants.map(v => v.color)))].sort();
  const sizes = [...new Set(all.flatMap(p => p.variants.map(v => v.size)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const fabrics = [...new Set(all.flatMap(p => p.fabric ? [p.fabric.split(",")[0].trim()] : []))].sort();
  const products = all.filter(p => {
    if (filters.q && !`${p.name} ${p.nameMs ?? ""} ${p.styleCode} ${p.category} ${p.fabric ?? ""}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.fabric && p.fabric?.split(",")[0].trim() !== filters.fabric) return false;
    if (!p.variants.some(v => (!filters.color || v.color === filters.color) && (!filters.size || v.size === filters.size))) return false;
    const stock = p.variants.some(v => (!filters.color || v.color === filters.color) && (!filters.size || v.size === filters.size) && v.stock > 0);
    if (filters.stock === "in" && !stock || filters.stock === "out" && stock) return false;
    if (filters.deals && lowestPrice(p.basePrice, p.priceBreaks) >= p.basePrice) return false;
    const price = lowestPrice(p.basePrice, p.priceBreaks) / 100;
    if (filters.min && Number.isFinite(Number(filters.min)) && price < Number(filters.min)) return false;
    if (filters.max && Number.isFinite(Number(filters.max)) && price > Number(filters.max)) return false;
    return true;
  });
  if (approved && filters.sort === "price-asc") products.sort((a, b) => lowestPrice(a.basePrice, a.priceBreaks) - lowestPrice(b.basePrice, b.priceBreaks));
  else if (approved && filters.sort === "price-desc") products.sort((a, b) => lowestPrice(b.basePrice, b.priceBreaks) - lowestPrice(a.basePrice, a.priceBreaks));
  else if (filters.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));
  const chips = Object.entries(filters).filter(([k, v]) => v && k !== "sort").map(([key, v]) => ({ key, label: key === "category" ? category(lang, v) : key === "color" ? colour(lang, v) : key === "fabric" ? fabricName(lang, v) : key === "stock" ? v === "in" ? c.inStock : c.outStock : key === "deals" ? c.deals : key === "min" ? `${c.min}: RM ${v}` : key === "max" ? `${c.max}: RM ${v}` : v }));
  const select = (name: "category" | "color" | "size" | "fabric" | "stock", label: string, options: { value: string; label: string }[]) => <label className="block text-sm font-medium">{label}<select className="shop-input mt-1.5 w-full" name={name} defaultValue={filters[name]}><option value="">{c.all}</option>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;

  return <div className="shop-shell">
    <ShopHeroSlider lang={lang}>
    <section className="shop-hero">
      <div className="shop-hero-copy relative z-10 max-w-xl py-8 sm:py-10">
        <p className="shop-hero-eyebrow">✦ {lang === "ms" ? "KOLEKSI BAYI & KANAK-KANAK" : "THE BABY & KIDS COLLECTION"}</p>
        <h1 className="shop-cute-title">{lang === "ms" ? "Gaya si kecil," : "Little styles,"}<br /><span>{lang === "ms" ? "senyuman besar." : "big smiles."}</span></h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">{c.intro}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600"><span>✓ {c.terms}</span><span>✓ {c.packs}</span></div>
        <a href="#collection" className="shop-button mt-5 w-fit">{c.allStyles} <span aria-hidden="true">♡</span></a>
      </div>
      <div className="shop-hero-photo"><Image src="/images/figma/hero.jpg" alt="" fill priority sizes="(max-width: 767px) 85vw, 40vw" className="object-cover" /></div>
      <RainbowDoodle />
      <BearMark className="shop-hero-bear" />
      <span className="shop-doodle-star shop-doodle-star-one" aria-hidden="true">✧</span>
      <span className="shop-doodle-star shop-doodle-star-two" aria-hidden="true">✦</span>
      <span className="shop-doodle-heart" aria-hidden="true">♡</span>
      <div className="shop-hero-sticker">{lang === "ms" ? "Untuk setiap" : "For every"}<br /><strong>{lang === "ms" ? "pengembaraan kecil" : "little adventure"}</strong><span aria-hidden="true"> ✿</span></div>
    </section>
    {all.filter(p => lowestPrice(p.basePrice, p.priceBreaks) < p.basePrice).map(p => {
      const offer = shopProduct(p, lang, approved);
      const best = lowestPrice(p.basePrice, p.priceBreaks);
      const minimum = p.priceBreaks.find(b => b.unitPrice === best)?.minQty;
      return <section className="shop-hero shop-hero-offer" key={p.id}>
        <div className="shop-hero-copy relative z-10 max-w-xl py-8 sm:py-10">
          <p className="shop-hero-eyebrow">{c.deals}</p>
          <h2 className="shop-cute-title shop-offer-title">{offer.name}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">{approved
            ? [c.from, money(best), c.perUnit, ' / ', minimum, c.garments + '+'].join(' ')
            : c.locked}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-600"><span>{c.terms}</span><span>{c.packs}</span></div>
          <Link href={'/catalog/' + p.id} className="shop-button mt-5 w-fit">{c.details} <span aria-hidden="true">&rarr;</span></Link>
        </div>
        <div className="shop-hero-photo shop-offer-photo"><Image src={offer.image ?? "/images/figma/hero.jpg"} alt={offer.name} fill sizes="(max-width: 767px) 85vw, 40vw" className="object-contain" /></div>
        <RainbowDoodle />
        <BearMark className="shop-hero-bear" />
        <span className="shop-doodle-star shop-doodle-star-one" aria-hidden="true">&#10023;</span>
        <span className="shop-doodle-heart" aria-hidden="true">&#9825;</span>
        <div className="shop-hero-sticker">{c.deals}<br /><strong>{offer.category}</strong></div>
      </section>;
    })}
    </ShopHeroSlider>

    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
      <nav aria-label={c.category} className="flex max-w-full gap-2 overflow-x-auto pb-1">
        <Link className={`shop-chip ${!filters.category ? "shop-chip-active" : ""}`} href={link({ category: "" })}>{c.catalogue}</Link>
        {categories.map(cat => <Link key={cat} href={link({ category: cat })} className={`shop-chip ${filters.category === cat ? "shop-chip-active" : ""}`}><span aria-hidden="true" className="mr-2">{categoryEmoji(cat)}</span>{category(lang, cat)}</Link>)}
      </nav>
      {priced && priced.lines.length > 0 && <Link href="/cart" className="text-sm font-medium text-[#48634f]">{c.total}: {money(priced.subtotal)} →</Link>}
    </div>

    <div className="shop-catalogue-layout mt-6">
      <aside>
        <FilterPanel title={c.filters} key={params.toString()}>
          <form action={path} className="shop-filter-fields mt-5 space-y-5">
            <label className="block text-sm font-medium">{c.search}<input className="shop-input mt-1.5 w-full" type="search" name="q" defaultValue={filters.q} placeholder={lang === "ms" ? "cth. kapas" : "e.g. cotton"} /></label>
            {select("category", c.category, categories.map(v => ({ value: v, label: category(lang, v) })))}
            {select("size", c.size, sizes.map(v => ({ value: v, label: v })))}
            {select("color", c.colour, colors.map(v => ({ value: v, label: colour(lang, v) })))}
            {select("fabric", c.fabric, fabrics.map(v => ({ value: v, label: fabricName(lang, v) })))}
            {select("stock", c.availability, [{ value: "in", label: c.inStock }, { value: "out", label: c.outStock }])}
            {approved && <fieldset><legend className="text-sm font-medium">{c.price}</legend><div className="mt-1.5 grid grid-cols-2 gap-2"><input name="min" aria-label={c.min} placeholder={c.min} type="number" min="0" step="0.01" defaultValue={filters.min} className="shop-input min-w-0" /><input name="max" aria-label={c.max} placeholder={c.max} type="number" min="0" step="0.01" defaultValue={filters.max} className="shop-input min-w-0" /></div></fieldset>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="deals" value="1" defaultChecked={!!filters.deals} className="h-4 w-4 accent-[#48634f]" />{c.deals}</label>
            <label className="block text-sm font-medium">{c.sort}<select name="sort" defaultValue={filters.sort} className="shop-input mt-1.5 w-full"><option value="newest">{c.newest}</option><option value="name">{c.name}</option>{approved && <><option value="price-asc">{c.low}</option><option value="price-desc">{c.high}</option></>}</select></label>
            <button className="shop-button w-full">{c.applyFilters} →</button>
            <Link href={path} className="block text-center text-sm underline underline-offset-4">{c.clear}</Link>
          </form>
        </FilterPanel>
        <div className="mt-5 hidden rounded-xl bg-[#edf1ea] p-5 lg:block"><p className="text-lg font-medium">{c.help}</p><p className="mt-2 text-xs leading-relaxed text-stone-600">{c.helpBody}</p><Link href="/#how" className="mt-3 block text-xs font-medium underline underline-offset-4">{c.readMore} ↗</Link></div>
      </aside>
      <section id="collection" className="min-w-0 scroll-mt-32" aria-label={c.allStyles}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{filters.category ? category(lang, filters.category) : c.allStyles}<span className="ml-2 text-sm font-normal text-stone-500">{products.length} {c.styles}</span></h2><span className="text-xs text-stone-500">{c.minimums}</span></div>
        {chips.length > 0 && <nav aria-label={c.selected} className="mb-5 flex flex-wrap gap-2">{chips.map(chip => <Link key={chip.key} href={link({ [chip.key]: "" })} className="rounded-lg bg-[#eee9e0] px-3 py-1.5 text-xs" aria-label={`${c.clear}: ${chip.label}`}>{chip.label} <span aria-hidden="true">×</span></Link>)}</nav>}
        {!approved && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dbe2d7] bg-[#f1f5ef] px-4 py-3 text-sm"><p>{c.locked}</p><Link href={user ? "/pending" : "/register"} className="font-semibold underline underline-offset-4">{user ? c.pending : c.apply} ↗</Link></div>}
        {products.length ? <div className="shop-product-grid">{products.map(p => <ProductCard key={`${p.id}:${filters.color}:${filters.size}`} product={shopProduct(p, lang, approved, priced?.lines.filter(l => l.productId === p.id).reduce((sum, l) => sum + l.units, 0))} lang={lang} accountHref={user ? "/pending" : "/login"} preferredColor={filters.color} preferredSize={filters.size} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-20 text-center"><span className="text-4xl text-[#819579]" aria-hidden="true">✿</span><h3 className="mt-3 text-2xl">{c.noResults}</h3><p className="mt-2 text-sm text-stone-500">{c.tryFilters}</p><Link href={path} className="shop-button mx-auto mt-5 w-fit">{c.clear} →</Link></div>}
      </section>
    </div>
  </div>;
}
