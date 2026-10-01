"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { addToCartInline } from "@/app/actions/cart";
import { money } from "@/lib/format";
import { colorSwatch } from "@/lib/display";
import { unitPriceFor, lowestPrice } from "@/lib/pricing";
import { shopCopy } from "@/lib/shop-copy";
import type { Lang } from "@/lib/i18n";

/** Only public product data and explicitly authorized prices cross into the client. */
export type ShopProduct = {
  id: string; name: string; styleCode: string; category: string; image: string | null;
  moq: number; fabric: string | null;
  colors: { value: string; label: string }[];
  variants: { color: string; size: string }[];
  packs: { id: string; label: string; units: number; colors: string[] }[];
  pricing: { base: number; breaks: { minQty: number; unitPrice: number }[]; cartUnits: number } | null;
};

export default function ProductCard({ product: p, lang, accountHref = "/login", preferredColor = "", preferredSize = "", detail = false }: {
  product: ShopProduct; lang: Lang; accountHref?: string; preferredColor?: string; preferredSize?: string; detail?: boolean;
}) {
  const c = shopCopy(lang);
  const id = useId();
  const [color, setColor] = useState(p.colors.some(x => x.value === preferredColor) ? preferredColor : p.colors[0]?.value ?? "");
  const optionsFor = (value: string) => [
    ...p.packs.filter(pk => pk.colors.includes(value)).map(pk => ({ value: `pack:${pk.id}`, label: `${c.prepack} · ${pk.units} ${c.garments}`, pack: pk })),
    ...p.variants.filter(v => v.color === value).map(v => ({ value: v.size, label: `${c.loose} · ${v.size}`, pack: null })),
  ];
  const options = optionsFor(color);
  const [selection, setSelection] = useState(options.some(o => o.value === preferredSize) ? preferredSize : options[0]?.value ?? "");
  const [qty, setQty] = useState(String(p.moq));
  const [feedback, action, pending] = useActionState(addToCartInline, { ok: false, message: "" });
  const selected = options.find(o => o.value === selection);
  const entered = Number(qty);
  const valid = Number.isSafeInteger(entered) && entered > 0 && entered <= 10000 && !!selected;
  const packCount = selected?.pack ? Math.ceil(entered / selected.pack.units) : 0;
  const units = valid ? selected?.pack ? packCount * selected.pack.units : entered : 0;
  const unitPrice = p.pricing ? unitPriceFor(p.pricing.base, p.pricing.breaks, p.pricing.cartUnits + units) : 0;
  const shortfall = Math.max(0, p.moq - units - (p.pricing?.cartUnits ?? 0));

  return (
    <article className={`shop-product group ${detail ? "shop-product-detail" : ""}`}>
      <Link href={`/catalog/${p.id}`} className="shop-product-image" aria-label={`${c.details}: ${p.name}`}>
        {p.image ? <Image src={p.image} alt={p.name} fill sizes={detail ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 28vw"} className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <span className="text-5xl" aria-hidden="true">✿</span>}
        <span className="shop-image-label">{p.category}</span>
        <span className="shop-image-link" aria-hidden="true">↗</span>
      </Link>
      <div className="shop-product-body">
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500"><span>{p.styleCode}</span><span>{p.colors.length} {c.colours}</span></div>
        <h2 className="mt-1 text-xl font-semibold leading-tight"><Link href={`/catalog/${p.id}`}>{p.name}</Link></h2>
        {p.fabric && <p className="mt-1 break-words text-sm text-stone-500" title={p.fabric}>{p.fabric}</p>}
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
          {p.pricing ? <p className="text-lg font-semibold">{c.from} {money(lowestPrice(p.pricing.base, p.pricing.breaks))}<span className="ml-1 text-xs font-normal text-stone-500">{c.perUnit}</span></p> : <p className="text-sm font-medium text-stone-600">{c.loginPrices}</p>}
          <span className="rounded-md bg-[#f5f1e9] px-2 py-1 text-xs">{c.moq} {p.moq}</span>
        </div>

        {p.pricing ? <form action={action} className="mt-4 border-t border-stone-200 pt-4">
          <input type="hidden" name="productId" value={p.id} />
          <fieldset>
            <legend className="mb-2 text-xs font-medium">{c.colourLabel} <span className="font-normal text-stone-500">— {p.colors.find(x => x.value === color)?.label}</span></legend>
            <div className="flex flex-wrap gap-2">
              {p.colors.map(col => <label key={col.value} title={col.label} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="color" value={col.value} checked={color === col.value} onChange={() => {
                  setColor(col.value);
                  const next = optionsFor(col.value);
                  if (!next.some(o => o.value === selection)) setSelection(next[0]?.value ?? "");
                }} aria-label={col.label} />
                <span className="block h-8 w-8 rounded-full border-[3px] border-white ring-1 ring-stone-200 peer-checked:ring-2 peer-checked:ring-[#48634f] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4" style={{ backgroundColor: colorSwatch(col.value) }} />
              </label>)}
            </div>
          </fieldset>
          <label htmlFor={`${id}-size`} className="mt-3 block text-xs font-medium">{c.orderAs}</label>
          <select id={`${id}-size`} name="size" value={selection} onChange={e => setSelection(e.target.value)} className="shop-input mt-1 w-full">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {selected?.pack && <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{selected.pack.label}</p>}
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label htmlFor={`${id}-qty`} className="block shrink-0 text-xs font-medium">{c.quantity}<input id={`${id}-qty`} name="qty" type="number" min="1" max="10000" step="1" required value={qty} onChange={e => setQty(e.target.value)} className="shop-input mt-1 block w-24" /></label>
            <div className="ml-auto pb-1 text-right"><span className="block text-xs text-stone-500">{c.estimate}</span><strong className="text-xl">{money(unitPrice * units)}</strong></div>
          </div>
          <p className="mt-2 text-xs text-stone-500">{c.actual}: {units} {c.garments}{selected?.pack ? ` · ${packCount} ${c.packCount}` : ""} · {money(unitPrice)} {c.perUnit}</p>
          {selected?.pack && <p className="mt-1 text-xs text-stone-500">{c.rounding}</p>}
          {shortfall > 0 && valid && <p className="mt-1 text-xs text-amber-800">{shortfall} {c.more.toLowerCase()}</p>}
          <button disabled={pending || !valid} className="shop-button mt-3 w-full">{pending ? c.adding : c.add}<span aria-hidden="true">+</span></button>
          <div role="status" aria-live="polite" className={feedback.message ? `mt-2 rounded-lg p-2 text-sm ${feedback.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-800"}` : ""}>
            {feedback.message}{feedback.ok && <> · {feedback.units} {c.garments} <Link href="/cart" className="underline">{c.viewCart} →</Link></>}
          </div>
        </form> : <div className="mt-4 border-t border-stone-200 pt-4">
          <div className="mb-3 flex flex-wrap gap-1.5" aria-label={c.available}>{p.colors.map(col => <span key={col.value} title={col.label} className="h-5 w-5 rounded-full border border-stone-300" style={{ background: colorSwatch(col.value) }} />)}</div>
          <p className="mb-3 text-xs text-stone-500">{c.locked}</p>
          <Link href={accountHref} className="shop-button w-full">{accountHref === "/pending" ? c.pending : c.loginPrices} <span aria-hidden="true">↗</span></Link>
        </div>}
        {p.pricing && <details className="mt-3 text-xs text-stone-500">
          <summary className="cursor-pointer py-1 font-medium text-stone-700">{c.breaks}</summary>
          <table className="mt-2 w-full text-left"><thead><tr><th className="py-1">{c.units}</th><th className="text-right">{c.unitPrice}</th></tr></thead><tbody>{[{ minQty: 1, unitPrice: p.pricing.base }, ...p.pricing.breaks].map((b, i) => <tr key={i} className="border-t border-stone-100"><td className="py-1">{b.minQty}+</td><td className="text-right">{money(b.unitPrice)}</td></tr>)}</tbody></table>
          <p className="mt-2 leading-relaxed">{c.estimateNote}</p>
        </details>}
      </div>
    </article>
  );
}
