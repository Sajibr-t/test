import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";
import { shopCopy } from "@/lib/shop-copy";

export default function KyteFooter({ lang }: { lang: Lang }) {
  const c = shopCopy(lang);
  return <footer className="shop-footer mt-12 border-t border-[#e4dfd5] bg-[#efeee7] print:hidden">
    <div className="shop-shell grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <div><Link href="/" className="text-2xl font-semibold">&#10035; Tiny Threads.</Link><p className="mt-4 text-xl">{c.footer}</p><p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">{c.footerBody}</p></div>
      <nav aria-label={c.account}><h2 className="mb-3 text-sm font-semibold">{c.account}</h2><div className="flex flex-col items-start gap-2 text-sm text-stone-600"><Link href="/login">{t(lang, "nav.login")}</Link><Link href="/register">{c.apply}</Link><Link href="/orders">{t(lang, "nav.myOrders")}</Link><Link href="/cart">{c.viewCart}</Link></div></nav>
      <div><h2 className="mb-3 text-sm font-semibold">{c.help}</h2><p className="text-sm leading-relaxed text-stone-600">{c.helpBody}</p><Link href="/#how" className="mt-4 inline-block text-sm underline underline-offset-4">{c.readMore} &#8599;</Link></div>
    </div>
    <nav aria-label={lang === 'ms' ? 'Maklumat kedai' : 'Store information'} className="shop-shell flex flex-wrap gap-5 pb-6 text-sm">{([['contact','Contact','Hubungi'],['delivery','Delivery','Penghantaran'],['returns','Returns','Pemulangan'],['privacy','Privacy','Privasi'],['terms','Terms','Terma']] as const).map(([slug,en,ms]) => <Link key={slug} href={'/info/' + slug} className="underline">{lang === 'ms' ? ms : en}</Link>)}</nav>
    <div className="shop-shell flex flex-wrap justify-between gap-3 border-t border-stone-300/60 py-5 text-xs text-stone-500"><span>&copy; {new Date().getFullYear()} Tiny Threads</span><span>MYR &middot; {c.terms}</span></div>
  </footer>;
}
