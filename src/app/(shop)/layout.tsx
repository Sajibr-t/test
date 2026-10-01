import Link from "next/link";
import { BearMark } from "@/components/shop/ShopDoodles";
import { getUser } from "@/lib/session";
import { readCart } from "@/lib/cart";
import { logout } from "@/app/actions/auth";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { shopCopy } from "@/lib/shop-copy";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import KyteFooter from "@/components/layout/KyteFooter";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [user, cart, lang] = await Promise.all([getUser(), readCart(), getLang()]);
  const c = shopCopy(lang);
  const approved = !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  return <div className="shop-root flex min-h-screen flex-col">
    <a href="#shop-main" className="shop-skip">{c.allStyles}</a>
    <div className="shop-announcement px-4 py-2 text-center text-xs tracking-wide text-white print:hidden">{c.trade} <span className="mx-3 opacity-50">&middot;</span> {c.terms}</div>
    <header className="shop-header print:hidden">
      <div className="shop-shell flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
        <Link href="/" className="shop-brand flex items-center gap-2 text-2xl font-semibold tracking-tight"><BearMark className="h-11 w-11" />Tiny Threads<span className="text-[#b89261]">.</span></Link>
        <nav className="hidden items-center gap-5 text-sm xl:flex" aria-label={c.catalogue}><Link href="/catalog">{c.catalogue}</Link><Link href="/catalog?sort=newest">{c.newIn}</Link><Link href="/catalog?deals=1">{c.deals}</Link></nav>
        <div className="shop-header-actions ml-auto flex flex-wrap items-center gap-3 text-sm"><LanguageSwitcher lang={lang} />{approved && <Link href="/cart" className="shop-cart-link">{t(lang, "nav.cart")} <span className="rounded-full bg-[#48634f] px-2 py-0.5 text-xs text-white" aria-label={c.lines}>{cart.length}</span></Link>}
          <details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium">{user ? c.account : t(lang, "nav.login")} <span aria-hidden="true">&#8964;</span></summary><div className="shop-account-menu">{user ? <><p className="border-b border-stone-100 px-3 pb-3 text-xs text-stone-500">{user.businessName}</p><Link href="/account">{lang === "ms" ? "Tetapan akaun" : "Account settings"}</Link>{approved ? <Link href="/orders">{t(lang, "nav.myOrders")}</Link> : <Link href="/pending">{c.pending}</Link>}{user.role === "ADMIN" && <Link href="/admin">{t(lang, "nav.admin")}</Link>}<form action={logout}><button className="w-full px-3 py-2 text-left">{t(lang, "nav.logout")}</button></form></> : <><Link href="/login">{t(lang, "nav.login")}</Link><Link href="/register">{c.apply}</Link></>}</div></details>
        </div>
        <nav className="flex w-full gap-5 overflow-x-auto border-t border-stone-100 pt-3 text-sm xl:hidden" aria-label={c.catalogue}><Link href="/catalog">{c.catalogue}</Link><Link href="/catalog?sort=newest">{c.newIn}</Link><Link href="/catalog?deals=1">{c.deals}</Link></nav>
      </div>
    </header>
    <main id="shop-main" className="shop-main flex-1 py-6 sm:py-8" tabIndex={-1}><div className="shop-shell">{children}</div></main>
    <KyteFooter lang={lang} />
  </div>;
}
