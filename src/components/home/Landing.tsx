import Image from "next/image";
import Link from "next/link";
import { getShopProducts } from "@/lib/shop-products";
import { getUser } from "@/lib/session";
import { getLang } from "@/lib/i18n-server";
import { category, productCopy, t } from "@/lib/i18n";
import { categoryImage, categoryEmoji, productImage } from "@/lib/display";
import { lowestPrice } from "@/lib/pricing";
import { money } from "@/lib/format";
import { BearMark, RainbowDoodle } from "@/components/shop/ShopDoodles";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import KyteFooter from "@/components/layout/KyteFooter";
import { homeCopy } from "@/lib/home-copy";
import HomeMenu from "./HomeMenu";
import ScrollAnimations from "./ScrollAnimations";

export default async function Landing() {
  const [products, user, lang] = await Promise.all([getShopProducts(), getUser(), getLang()]);
  const c = homeCopy(lang);
  const approved = !!user && (user.role === "ADMIN" || user.status === "APPROVED");
  const accountHref = approved ? "/catalog" : user ? "/pending" : "/register";
  const accountLabel = approved ? c.startOrder : user ? c.application : c.apply;
  const categories = [...new Set(products.map(p => p.category))];
  const nav = [
    { label: c.collections, href: "#collections" },
    { label: c.how, href: "#how" },
    { label: c.pricing, href: "#pricing" },
    { label: c.faq, href: "#faq" },
  ];

  return <div className="shop-root home-page">
    <a href="#home-main" className="shop-skip">{c.skip}</a>
    <div className="home-announcement">{c.announcement} <span aria-hidden="true">♡</span></div>
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-brand" aria-label="Tiny Threads"><BearMark className="h-11 w-11" />Tiny Threads<span>.</span></Link>
        <nav className="home-desktop-nav" aria-label={c.navigation}>{nav.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
        <div className="home-account">
          <LanguageSwitcher lang={lang} fallback="/" />
          <Link className="home-login" href={user ? approved ? "/orders" : "/pending" : "/login"}>{user ? approved ? t(lang, "nav.myOrders") : c.application : t(lang, "nav.login")}</Link>
          <Link href="/catalog" className="shop-button home-header-shop">{c.shop} <span aria-hidden="true">↗</span></Link>
          <HomeMenu label={c.menu}>
            <nav aria-label={c.navigation}>{nav.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href={accountHref}>{accountLabel}</Link><Link href={user ? "/orders" : "/login"}>{user ? t(lang, "nav.myOrders") : t(lang, "nav.login")}</Link></nav>
          </HomeMenu>
        </div>
      </div>
    </header>

    <main id="home-main" tabIndex={-1}>
      <ScrollAnimations />
      <section className="home-hero home-container">
        <div className="home-hero-text">
          <p className="home-eyebrow">✦ {c.eyebrow}</p>
          <h1>{c.titleFirst}<br /><span>{c.titleLast}</span></h1>
          <p className="home-intro">{c.intro}</p>
          <div className="home-hero-actions"><Link href="/catalog" className="shop-button">{c.shop} <span aria-hidden="true">↗</span></Link><Link href={accountHref} className="home-secondary">{accountLabel} <span aria-hidden="true">♡</span></Link></div>
          <div className="home-hero-notes"><span>✓ {c.noteOne}</span><span>✓ {c.noteTwo}</span></div>
        </div>
        <div className="home-hero-art">
          <div className="home-depth-orbit home-depth-orbit-back" aria-hidden="true" />
          <div className="home-depth-orbit home-depth-orbit-front" aria-hidden="true" />
          <span className="home-depth-pearl home-depth-pearl-lilac" aria-hidden="true" />
          <span className="home-depth-pearl home-depth-pearl-peach" aria-hidden="true" />
          <div className="home-kids-photo"><Image src="/images/figma/hero.jpg" alt={c.kidsAlt} fill priority sizes="(max-width: 767px) 65vw, 35vw" className="object-cover" /></div>
          <div className="home-baby-photo"><Image src="/images/product-onesie.jpg" alt={c.babyAlt} fill priority sizes="(max-width: 767px) 38vw, 20vw" className="object-cover" /><span>{c.babyToKids} ♡</span></div>
          <RainbowDoodle />
          <span className="home-art-star" aria-hidden="true">✧</span>
          <span className="home-art-heart" aria-hidden="true">♡</span>
          <div className="home-art-sticker">{c.stickerFirst}<br /><strong>{c.stickerLast}</strong> ✿</div>
        </div>
      </section>

      <div className="home-promise-strip"><span>✿ {c.stripOne}</span><span>♡ {c.stripTwo}</span><span>✦ {c.stripThree}</span></div>

      <section id="collections" className="home-section home-container">
        <div className="home-section-heading"><div><p className="home-eyebrow">{c.categoryEyebrow}</p><h2>{c.categoryTitle}</h2></div><Link href="/catalog" className="home-text-link">{c.seeAll} ↗</Link></div>
        {categories.length > 0 ? <div className="home-categories">{categories.map(cat => {
          const image = categoryImage(cat);
          return <Link key={cat} href={`/catalog?category=${encodeURIComponent(cat)}`} className="home-category">
            <span className="home-category-image">{image ? <Image src={image} alt="" fill sizes="(max-width: 639px) 40vw, 18vw" className="object-cover" /> : <span aria-hidden="true">{categoryEmoji(cat)}</span>}</span>
            <span className="home-category-name">{category(lang, cat)} <span aria-hidden="true">↗</span></span>
            <span className="home-category-count">{products.filter(p => p.category === cat).length} {c.styles}</span>
          </Link>;
        })}</div> : <p className="home-empty">{c.empty} <Link href={accountHref} className="underline">{accountLabel}</Link></p>}
      </section>

      <section id="featured" className="home-featured-band">
        <div className="home-section home-container">
          <div className="home-section-heading"><div><p className="home-eyebrow">{c.featuredEyebrow}</p><h2>{c.featuredTitle}</h2></div><Link href="/catalog?sort=newest" className="home-text-link">{c.seeNew} ↗</Link></div>
          {products.length > 0 ? <div className="home-featured-grid">{products.slice(0, 4).map(p => {
            const image = p.imageUrl ?? productImage(p.styleCode) ?? categoryImage(p.category);
            const copy = productCopy(lang, p);
            return <article className="home-featured-card" key={p.id}>
              <Link href={`/catalog/${p.id}`} className="home-featured-image" aria-label={`${c.view}: ${copy.name}`}>{image ? <Image src={image} alt={copy.name} fill sizes="(max-width: 639px) 43vw, (max-width: 1023px) 45vw, 23vw" className="object-cover" /> : <span aria-hidden="true">{categoryEmoji(p.category)}</span>}<span className="home-product-tag">{category(lang, p.category)}</span></Link>
              <div className="home-featured-copy"><p>{p.styleCode}</p><h3><Link href={`/catalog/${p.id}`}>{copy.name}</Link></h3><span className="home-moq">{c.minimum} {p.moq} {c.units}</span>
                {approved ? <strong className="home-featured-price">{c.from} {money(lowestPrice(p.basePrice, p.priceBreaks))}<small> / {c.unit}</small></strong> : <Link href={user ? "/pending" : "/login"} className="home-price-prompt">{user ? c.application : c.loginPrices} ↗</Link>}
              </div>
            </article>;
          })}</div> : <p className="home-empty">{c.empty}</p>}
        </div>
      </section>

      <section id="how" className="home-section home-container">
        <div className="home-centered-heading"><p className="home-eyebrow">{c.howEyebrow}</p><h2>{c.howTitle}</h2><p>{c.howIntro}</p></div>
        <div className="home-steps">{c.steps.map((step, i) => <article key={step.title}><span className="home-step-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
      </section>

      <section id="pricing" className="home-container home-pricing">
        <div><p className="home-eyebrow">{c.pricingEyebrow}</p><h2>{c.pricingTitle}</h2><p>{c.pricingBody}</p><Link href={accountHref} className="home-text-link">{accountLabel} ↗</Link></div>
        <div className="home-facts">{c.facts.map((fact, i) => <article key={fact.title}><span aria-hidden="true">{["♡", "✿", "✦"][i]}</span><div><h3>{fact.title}</h3><p>{fact.body}</p></div></article>)}</div>
      </section>

      <section id="faq" className="home-section home-container home-faq">
        <div><BearMark className="mb-4 h-16 w-16" /><p className="home-eyebrow">{c.faqEyebrow}</p><h2>{c.faqTitle}</h2><p>{c.faqIntro}</p></div>
        <div>{c.questions.map(question => <details key={question.title}><summary>{question.title}<span aria-hidden="true">+</span></summary><p>{question.body}</p></details>)}</div>
      </section>

      <section id="apply" className="home-container home-apply">
        <RainbowDoodle /><p className="home-eyebrow">{c.applyEyebrow}</p><h2>{c.applyTitle}</h2><p>{c.applyBody}</p><Link href={accountHref} className="shop-button">{accountLabel} <span aria-hidden="true">♡</span></Link><Link href="/catalog" className="home-text-link">{c.browseFirst} →</Link>
      </section>
    </main>
    <KyteFooter lang={lang} />
  </div>;
}
