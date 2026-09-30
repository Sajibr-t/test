/**
 * The public landing page at "/" - the marketing site a visitor sees first.
 *
 * Client component because the nav, mobile menu and newsletter form hold local
 * state. Styling is inline rather than Tailwind classes because this page came
 * from a design export and is kept self-contained: edit it without worrying
 * about knock-on effects elsewhere in the app.
 *
 * The content arrays near the top (CATEGORIES, STEPS, TESTIMONIALS, PERKS) are
 * the copy deck - change wording there rather than hunting through the markup.
 */
'use client'

import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { useState } from 'react'

const NAV_LINKS: [string, string][] = [
  ['Collections', '#collections'],
  ['How It Works', '#how'],
  ['Pricing', '#pricing'],
  ['About', '#apply'],
]

const CATEGORIES = [
  {
    name: 'Rompers & Onesies',
    emoji: '👶',
    desc: 'Everyday soft cotton essentials, NB–24M',
    bg: '#E3F5FE',
    badge: '⭐ Bestseller',
    badgeBg: '#92DBFD',
    image: 'https://images.unsplash.com/photo-1784717424541-12e9eea29015?w=500&h=600&fit=crop&auto=format',
  },
  {
    name: 'Sleepwear Sets',
    emoji: '🌙',
    desc: 'Cosy sleepers, sleep sacks & footed PJs',
    bg: '#E8F0FF',
    badge: '✨ New Season',
    badgeBg: '#A0B4FF',
    image: 'https://images.unsplash.com/photo-1711313532755-47fe78c65a50?w=500&h=600&fit=crop&auto=format',
  },
  {
    name: 'Seasonal Sets',
    emoji: '🌸',
    desc: 'Curated looks updated every quarter',
    bg: '#E8FAF0',
    badge: '🍂 Q4 Ready',
    badgeBg: '#6ECFA0',
    image: 'https://images.unsplash.com/photo-1774874017217-c441aa77c73b?w=500&h=600&fit=crop&auto=format',
  },
  {
    name: 'Accessories',
    emoji: '🎀',
    desc: 'Hats, bibs, booties & adorable gift sets',
    bg: '#FFF5E0',
    badge: '💛 High Margin',
    badgeBg: '#FFD6A5',
    image: 'https://images.unsplash.com/photo-1647761269925-9446047bda1d?w=500&h=600&fit=crop&auto=format',
  },
]

const STEPS = [
  { number: '01', emoji: '🔍', title: 'Browse & Pick', desc: 'Explore our seasonal lookbooks and order free samples. No account needed!' },
  { number: '02', emoji: '📋', title: 'Get Your Quote', desc: 'Tell us your quantities and get a personalised price sheet within 24 hours.' },
  { number: '03', emoji: '📦', title: 'Receive & Sell!', desc: 'Your order arrives in adorable branded packaging, ready for your shop floor.' },
]

const TESTIMONIALS = [
  {
    quote: "Our customers LOVE the quality. We've reordered three seasons in a row — TinyThreads just gets what boutiques need.",
    name: 'Sophie Laurent',
    role: 'Owner, Petit Boutique · Lyon, France',
    avatar: '🧡',
    bg: '#E3F5FE',
  },
  {
    quote: "The organic certification helped us charge a premium and customers are proud to buy it. Couldn't be happier!",
    name: 'Mara Okonkwo',
    role: 'Buyer, Little Willow · Cape Town',
    avatar: '💚',
    bg: '#E8FAF0',
  },
  {
    quote: "Fast delivery, gorgeous unboxing, and a team that's genuinely sweet to deal with. 10/10 would recommend.",
    name: 'Camille Rossi',
    role: 'Founder, Nido Kids · Milan',
    avatar: '💜',
    bg: '#EDE8FF',
  },
]

const PERKS = [
  { emoji: '🌿', title: 'GOTS Organic Cotton', desc: 'Safe for newborn skin — certified from field to final stitch.' },
  { emoji: '🎁', title: 'Retail-Ready Packaging', desc: 'Branded hang tags, tissue wrapping, or private label — your choice!' },
  { emoji: '🔄', title: 'Seasonal Restocks', desc: '4 fresh collections per year with 60-day advance order windows.' },
  { emoji: '💌', title: 'Dedicated Support', desc: 'Every partner gets a personal account manager who truly cares.' },
]

// Decorative floating shapes
function FloatingShape({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return <div className={`absolute pointer-events-none select-none ${className}`} style={style} />
}

export default function Landing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      // hand off to the real wholesale application
      setTimeout(() => {
        window.location.href = '/register'
      }, 1200)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#FFFFFF', color: '#3D3540' }}>

      {/* ── NAV (floating pill) ── */}
      <header
        className="fixed top-4 left-1/2 z-50 flex items-center justify-between gap-4 px-4 py-2"
        style={{
          transform: 'translateX(-50%)',
          width: 'min(920px, calc(100% - 2rem))',
          background: 'rgba(255,252,248,0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: 9999,
          border: '2px solid #E3F5FE',
          boxShadow: '0 8px 32px rgba(146,219,253,0.18), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: '#92DBFD' }}
          >
            🍼
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#3D3540' }}>
            Tiny<span style={{ color: '#2E9BD6' }}>Threads</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm transition-all"
              style={{ color: '#9B8FA0', fontWeight: 600 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2E9BD6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9B8FA0' }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/login"
            className="hidden sm:inline text-xs font-bold px-3 py-2 transition-colors"
            style={{ color: '#9B8FA0' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2E9BD6' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9B8FA0' }}
          >
            Log in
          </a>
          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all"
            style={{ background: '#92DBFD', color: '#0E4E6E' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#5FC4F2'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#92DBFD'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
          >
            🛍️ Shop
          </Link>
          <button
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
            style={{ background: '#E3F5FE', color: '#2E9BD6' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-20 px-6 flex flex-col gap-4" style={{ background: '#FFFFFF' }}>
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="py-3 text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: '#3D3540', borderBottom: '2px solid #E3F5FE' }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            href="/catalog"
            className="mt-4 text-center py-4 rounded-full text-lg font-bold"
            style={{ background: '#92DBFD', color: '#0E4E6E' }}
            onClick={() => setMobileOpen(false)}
          >
            🛍️ Shop the Catalogue
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative pt-24 overflow-hidden">
        {/* Pastel blob background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 70% 40%, #E3F5FE 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, #E8FAF0 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 90%, #EDE8FF 0%, transparent 50%)',
          }}
        />

        {/* Floating decorative dots */}
        <FloatingShape className="float-slow w-10 h-10 rounded-full opacity-40" style={{ background: '#92DBFD', top: 120, left: '8%' }} />
        <FloatingShape className="float-slower w-6 h-6 rounded-full opacity-30" style={{ background: '#FFD6A5', top: 200, left: '15%' }} />
        <FloatingShape className="float-slow w-14 h-14 rounded-full opacity-20" style={{ background: '#B8E8D0', top: 100, right: '12%' }} />
        <FloatingShape className="float-slower w-8 h-8 rounded-full opacity-30" style={{ background: '#D4C5F0', top: 300, right: '6%' }} />
        <FloatingShape className="float-slow w-4 h-4 rounded-full opacity-40" style={{ background: '#92DBFD', top: 180, right: '22%' }} />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:min-h-[80vh]">
          {/* Text */}
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6"
              style={{ background: '#E3F5FE', color: '#2E9BD6', letterSpacing: '0.05em' }}
            >
              🌟 PREMIUM BABY WHOLESALE
            </div>
            <h1
              className="leading-none mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
                color: '#3D3540',
                lineHeight: 1.1,
              }}
            >
              Soft, sweet{' '}
              <span
                className="relative inline-block"
                style={{ color: '#2E9BD6' }}
              >
                baby
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 120 10" preserveAspectRatio="none" style={{ height: 8 }}>
                  <path d="M0 8 Q30 0 60 6 Q90 12 120 4" fill="none" stroke="#FFD6A5" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>{' '}
              clothes
              <br />your boutique
              <br />will{' '}
              <span style={{ color: '#6ECFA0' }}>
                💚 love.
              </span>
            </h1>
            <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: '#9B8FA0', fontWeight: 500 }}>
              Organic cotton essentials for newborns & toddlers. Designed for boutiques, built for bulk — with minimums that don&apos;t hurt small shops.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#collections"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-all"
                style={{ background: '#92DBFD', color: '#0E4E6E', boxShadow: '0 6px 20px rgba(146,219,253,0.45)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
              >
                Browse Collections 🛍️
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold border-2 transition-all"
                style={{ border: '2px solid #FFD6A5', color: '#3D3540', background: 'transparent' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#FFF5E0')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                How It Works ✨
              </a>
            </div>

            {/* Trust pills */}
            <div className="mt-10 flex flex-wrap gap-2">
              {['🌿 GOTS Certified', '🚢 Ships Worldwide', '📦 MOQ from 24 units', '⭐ 500+ Boutiques'].map((t) => (
                <span
                  key={t}
                  className="text-xs font-bold px-4 py-2 rounded-full"
                  style={{ background: '#fff', border: '2px solid #E3F5FE', color: '#9B8FA0' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Main big image */}
            <div
              className="absolute rounded-[2.5rem] overflow-hidden"
              style={{ width: '72%', height: '78%', top: 0, right: 0, background: '#E3F5FE', boxShadow: '0 20px 60px rgba(146,219,253,0.25)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1622777702110-d6eab5657ce5?w=700&h=800&fit=crop&auto=format"
                alt="Cute baby in soft cotton onesie"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Small accent image */}
            <div
              className="absolute rounded-[2rem] overflow-hidden border-4 border-white"
              style={{ width: '45%', height: '50%', bottom: 0, left: 0, background: '#E8FAF0', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1766918780916-228d10b071be?w=400&h=500&fit=crop&auto=format"
                alt="Baby clothes neatly arranged"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute z-10 px-4 py-3 rounded-2xl"
              style={{ bottom: '30%', right: 0, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', border: '2px solid #E3F5FE' }}
            >
              <div className="text-xs font-bold mb-0.5" style={{ color: '#2E9BD6' }}>NEW ARRIVALS 🎀</div>
              <div className="text-sm font-bold" style={{ color: '#3D3540' }}>Spring / Summer 2027</div>
            </div>
            {/* Star decoration */}
            <div className="absolute text-3xl" style={{ top: -12, left: '25%', transform: 'rotate(-15deg)' }}>⭐</div>
            <div className="absolute text-xl" style={{ bottom: '5%', right: '5%', transform: 'rotate(10deg)' }}>🌸</div>
          </div>
        </div>

        </section>

      {/* ── CATEGORIES ── */}
      <Reveal variant="rise">
      <section id="collections" className="py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-4"
              style={{ background: '#E3F5FE', color: '#2E9BD6' }}
            >
              🧸 WHAT WE OFFER
            </div>
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#3D3540' }}
            >
              Shop by Category
            </h2>
            <svg className="mx-auto mt-2" width="92" height="10" viewBox="0 0 92 10" aria-hidden="true"><path d="M2 6 Q 14 2 26 6 T 50 6 T 74 6 T 90 6" fill="none" stroke="#F27D9D" strokeWidth="3" strokeLinecap="round" opacity="0.65" /></svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="group relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300"
                style={{ background: cat.bg, aspectRatio: '3/4', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                onClick={() => { window.location.href = '/catalog' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 rounded-[2rem]"
                  style={{ background: 'linear-gradient(to top, rgba(61,53,64,0.75) 0%, rgba(61,53,64,0.15) 55%, transparent 100%)' }}
                />
                <div className="absolute top-4 left-4">
                  <span
                    className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: cat.badgeBg, color: '#fff' }}
                  >
                    {cat.badge}
                  </span>
                </div>
                <div className="absolute top-4 right-4 text-2xl">{cat.emoji}</div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── HOW IT WORKS ── */}
      <Reveal variant="left">
      <section
        id="how"
        className="py-20 px-4 md:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FDFEFF 0%, #F3F9FE 100%)' }}
      >
        {/* soft cloud edges */}
        <svg className="absolute pointer-events-none" style={{ bottom: -20, left: -30 }} width="300" height="120" viewBox="0 0 300 120" aria-hidden="true">
          <ellipse cx="80" cy="100" rx="120" ry="50" fill="#DCEBF8" opacity="0.55" />
          <ellipse cx="200" cy="115" rx="110" ry="45" fill="#E7F2FB" opacity="0.6" />
        </svg>
        <svg className="absolute pointer-events-none" style={{ bottom: -25, right: -40 }} width="320" height="130" viewBox="0 0 320 130" aria-hidden="true">
          <ellipse cx="230" cy="105" rx="130" ry="55" fill="#DCEBF8" opacity="0.55" />
          <ellipse cx="90" cy="120" rx="110" ry="45" fill="#E7F2FB" opacity="0.6" />
          <ellipse cx="290" cy="60" rx="60" ry="70" fill="#E4F2E2" opacity="0.5" />
        </svg>
        <svg className="absolute pointer-events-none" style={{ top: -10, left: '10%' }} width="180" height="60" viewBox="0 0 180 60" aria-hidden="true">
          <ellipse cx="90" cy="10" rx="90" ry="34" fill="#EAF4FC" opacity="0.7" />
        </svg>
        <svg className="absolute pointer-events-none" style={{ top: -14, right: '8%' }} width="200" height="60" viewBox="0 0 200 60" aria-hidden="true">
          <ellipse cx="100" cy="8" rx="100" ry="36" fill="#EAF4FC" opacity="0.6" />
        </svg>

        <div className="max-w-[1240px] mx-auto relative">
          <div className="text-center mb-14">
            <div className="text-[11px] font-extrabold tracking-[0.25em] mb-3" style={{ color: '#5B8FD9' }}>
              SIMPLE PROCESS
            </div>
            <h2 className="text-3xl md:text-[34px] font-extrabold mb-2" style={{ color: '#1D3E6E' }}>
              From First Look to Shop Floor
            </h2>
            <p className="text-sm font-medium" style={{ color: '#7C8698' }}>
              Start wholesale in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-y-12 md:gap-x-2 items-start max-w-[1080px] mx-auto">
            {[
              { icon: 'doc', tile: '#FDE7ED', deep: '#E8688C', badge: '#F07C9C', title: 'Submit Inquiry', desc: 'Tell us about your business and requirements.' },
              null,
              { icon: 'tag', tile: '#FDF3DC', deep: '#E9A23B', badge: '#F2AC46', title: 'Get Wholesale Pricing', desc: 'Receive our best rates and catalog.' },
              null,
              { icon: 'box', tile: '#E3F0FC', deep: '#4287CE', badge: '#5397DB', title: 'Place Your Order', desc: 'Choose your favorite styles and quantities.' },
              null,
              { icon: 'truck', tile: '#E8F5E6', deep: '#5CA968', badge: '#6BB877', title: 'Fast Shipping', desc: 'We deliver worldwide, so you can start selling sooner.' },
            ].map((s, idx) =>
              s === null ? (
                <svg key={'sep' + idx} className="hidden md:block mt-[40px]" width="72" height="14" viewBox="0 0 72 14" aria-hidden="true">
                  <path d="M2 7 H56" stroke="#9CC4EA" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
                  <path d="M56 2 L66 7 L56 12" fill="none" stroke="#9CC4EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div key={s.title} className="text-center px-2">
                  <div className="relative mx-auto w-fit mb-5">
                    <div className="w-[92px] h-[92px] rounded-full flex items-center justify-center" style={{ background: s.tile, boxShadow: '0 8px 22px rgba(29,62,110,0.10)' }}>
                      {s.icon === 'doc' && (
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke={s.deep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 4 H21 L26 9 V30 H9 Z" />
                          <path d="M21 4 V9 H26" />
                          <path d="M13 15 H22 M13 20 H22 M13 25 H18" />
                        </svg>
                      )}
                      {s.icon === 'tag' && (
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke={s.deep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15 L15 4 H28 V17 L17 28 Q15 30 13 28 L6 21 Q4 19 4 17 Z" transform="rotate(8 16 16)" />
                          <circle cx="22.5" cy="9.5" r="2.2" />
                        </svg>
                      )}
                      {s.icon === 'box' && (
                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke={s.deep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 4 L29 10 V24 L17 30 L5 24 V10 Z" />
                          <path d="M5 10 L17 16 L29 10 M17 16 V30" />
                        </svg>
                      )}
                      {s.icon === 'truck' && (
                        <svg width="36" height="34" viewBox="0 0 36 34" fill="none" stroke={s.deep} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8 H21 V23 H3 Z" />
                          <path d="M21 13 H28 L33 18 V23 H21" />
                          <circle cx="10" cy="26" r="3" />
                          <circle cx="27" cy="26" r="3" />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[12px] font-extrabold text-white" style={{ background: s.badge, border: '2.5px solid #FFFFFF' }}>
                      {idx / 2 + 1}
                    </div>
                  </div>
                  <h3 className="text-[15px] font-extrabold mb-1.5" style={{ color: '#1D3E6E' }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed max-w-[220px] mx-auto" style={{ color: '#7C8698', fontWeight: 500 }}>{s.desc}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── FEATURED PRODUCTS ── */}
      <Reveal variant="rise">
      <section id="featured" className="py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-3"
                style={{ background: '#EDE8FF', color: '#7B61C4' }}
              >
                💜 FEATURED PIECES
              </div>
              <h2
                className="text-4xl"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#3D3540' }}
              >
                Most loved this season
              </h2>
              <svg className="mt-2" width="92" height="10" viewBox="0 0 92 10" aria-hidden="true"><path d="M2 6 Q 14 2 26 6 T 50 6 T 74 6 T 90 6" fill="none" stroke="#8A6FD1" strokeWidth="3" strokeLinecap="round" opacity="0.65" /></svg>
            </div>
            <Link
              href="/catalog"
              className="text-sm font-bold flex items-center gap-1 whitespace-nowrap transition-opacity hover:opacity-70"
              style={{ color: '#2E9BD6' }}
            >
              See full catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Big card */}
            <div
              className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] group cursor-pointer"
              style={{ background: '#E3F5FE', minHeight: 360 }}
              onClick={() => { window.location.href = '/catalog' }}
            >
              <img
                src="https://images.unsplash.com/photo-1734939205476-1039385aea9f?w=1200&h=720&fit=crop&auto=format"
                alt="Baby clothing collection"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(61,53,64,0.65) 0%, transparent 65%)' }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <span
                  className="inline-flex text-xs font-bold px-3 py-1.5 rounded-full mb-3 w-fit"
                  style={{ background: '#92DBFD', color: '#0E4E6E' }}
                >
                  🆕 New Arrival
                </span>
                <h3
                  className="text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Essential Romper Set 🧸
                </h3>
                <p className="text-sm text-white/80 mb-4 max-w-xs">
                  3-piece organic cotton gift set. 8 colourways, NB–24M.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-white font-bold">From RM 4.80 / unit</span>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                  >
                    MOQ 48 sets
                  </span>
                </div>
              </div>
            </div>

            {/* Two small cards */}
            <div className="flex flex-col gap-5">
              {[
                {
                  title: 'Cloud Sleepwear ☁️',
                  price: 'RM 3.20 / unit',
                  moq: 'MOQ 36',
                  img: 'https://images.unsplash.com/photo-1701272850369-2e2a4b3fca7e?w=600&h=440&fit=crop&auto=format',
                  bg: '#E8F0FF',
                },
                {
                  title: 'Linen Summer Set 🌞',
                  price: 'RM 5.50 / unit',
                  moq: 'MOQ 24',
                  img: 'https://images.unsplash.com/photo-1605644235751-709c7254e3e3?w=600&h=440&fit=crop&auto=format',
                  bg: '#FFF5E0',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-[2rem] group cursor-pointer flex-1 transition-all duration-300"
                  style={{ background: item.bg, minHeight: 155 }}
                  onClick={() => { window.location.href = '/catalog' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(61,53,64,0.7) 0%, transparent 60%)' }}
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold text-sm">{item.price}</span>
                      <span className="text-white/60 text-xs">{item.moq}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── PERKS ── */}
      <Reveal variant="tilt">
      <section
        id="perks"
        className="py-20 px-4 md:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #ECF7FE 0%, #DDEFFC 100%)' }}
      >

        <div className="max-w-[1440px] mx-auto">
          <div className="mb-14 text-center">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(146,219,253,0.15)', color: '#2E9BD6' }}
            >
              💝 WHY TINYTHREADS
            </div>
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
            >
              Built with love for{' '}
              <span style={{ color: '#2E9BD6' }}>little ones</span>
            </h2>
            <svg className="mx-auto mt-2" width="92" height="10" viewBox="0 0 92 10" aria-hidden="true"><path d="M2 6 Q 14 2 26 6 T 50 6 T 74 6 T 90 6" fill="none" stroke="#3FA9DD" strokeWidth="3" strokeLinecap="round" opacity="0.65" /></svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERKS.map((p, i) => {
              const look = [
                { tile: '#E3F6EC', deep: '#4CAF82' },
                { tile: '#FFE4EE', deep: '#F27D9D' },
                { tile: '#DFF0FC', deep: '#3FA9DD' },
                { tile: '#FFF0D6', deep: '#F2A93B' },
              ][i]
              return (
              <div
                key={p.title}
                className="p-6 rounded-[2rem] bg-white transition-transform duration-300 cursor-default hover:-translate-y-1.5"
                style={{ border: '2px dashed ' + look.deep, boxShadow: '0 10px 26px rgba(61,53,64,0.07)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ background: look.tile, border: '3px solid #fff', boxShadow: '0 5px 14px rgba(61,53,64,0.10)' }}
                >
                  {p.emoji}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#123F58' }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6E7A8A', fontWeight: 500 }}>
                  {p.desc}
                </p>
              </div>
              )
            })}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── TESTIMONIALS ── */}
      <Reveal variant="rise">
      <section id="stories" className="py-20 px-4 md:px-8 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-4"
              style={{ background: '#FFF5E0', color: '#E0960A' }}
            >
              💛 PARTNER STORIES
            </div>
            <h2
              className="text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#3D3540' }}
            >
              Loved by boutiques
            </h2>
            <svg className="mx-auto mt-2" width="92" height="10" viewBox="0 0 92 10" aria-hidden="true"><path d="M2 6 Q 14 2 26 6 T 50 6 T 74 6 T 90 6" fill="none" stroke="#F2A93B" strokeWidth="3" strokeLinecap="round" opacity="0.65" /></svg>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => {
              const deep = ['#3FA9DD', '#4CAF82', '#8A6FD1'][i]
              return (
              <div
                key={t.name}
                className="p-7 rounded-[2rem] relative overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-1.5"
                style={{ border: '2px dashed ' + deep, boxShadow: '0 10px 28px rgba(61,53,64,0.08)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: t.bg, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(61,53,64,0.10)' }}
                  >
                    {t.avatar}
                  </div>
                  <div className="text-sm tracking-wide" style={{ color: '#F5C542' }}>★★★★★</div>
                </div>
                <p
                  className="text-base leading-relaxed mb-5 font-medium"
                  style={{ color: '#3D3540' }}
                >
                  &quot;{t.quote}&quot;
                </p>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#3D3540' }}>{t.name}</div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: '#9B8FA0' }}>{t.role}</div>
                </div>
                <div className="absolute top-4 right-5 text-3xl select-none" style={{ color: deep, opacity: 0.25 }}>❝</div>
              </div>
              )
            })}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── PRICING ── */}
      <Reveal variant="zoom">
      <section id="pricing" className="py-20 px-4 md:px-8 relative overflow-hidden" style={{ background: '#F5F0FF' }}>
        {/* corner accents */}

        <div className="max-w-[1240px] mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-4"
            style={{ background: '#E4DAF7', color: '#6C4FBF' }}
          >
            💜 CLEAR PRICING
          </div>
          <h2
            className="text-4xl md:text-5xl mb-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#3D3540' }}
          >
            Simple tiers that grow with you
          </h2>
          <p className="text-base mb-14 font-medium" style={{ color: '#9B8FA0' }}>
            No hidden fees. No long-term contracts. Just happy shopping!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {[
              { tier: 'Starter', emoji: '🌱', units: '24–119 units', price: 'List price', note: 'Perfect for first orders', tile: '#E3F6EC', deep: '#3E9A6C', popular: false },
              { tier: 'Boutique', emoji: '⭐', units: '120–499 units', price: '12% off', note: 'Best for growing shops', tile: '#DFF0FC', deep: '#2E8FC4', popular: true },
              { tier: 'Partner', emoji: '🏆', units: '500+ units', price: '22% off', note: 'For volume champions', tile: '#FFF0D6', deep: '#C7862B', popular: false },
            ].map((p) => (
              <div
                key={p.tier}
                className="relative rounded-[2rem] bg-white p-7 pt-9 text-center transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  border: '2px dashed ' + p.deep,
                  boxShadow: p.popular
                    ? '0 18px 44px rgba(46,143,196,0.25)'
                    : '0 8px 24px rgba(61,53,64,0.08)',
                }}
              >
                {p.popular && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold text-white"
                    style={{ background: '#3FA9DD', boxShadow: '0 6px 16px rgba(63,169,221,0.4)' }}
                  >
                    🔥 Most Popular
                  </span>
                )}
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                  style={{ background: p.tile, border: '3px solid #fff', boxShadow: '0 6px 16px rgba(61,53,64,0.10)' }}
                >
                  {p.emoji}
                </div>
                <div className="mb-2 text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#3D3540' }}>
                  {p.tier}
                </div>
                <span
                  className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: p.tile, color: p.deep }}
                >
                  {p.units}
                </span>
                <div className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: p.deep }}>
                  {p.price}
                </div>
                <div className="mt-1.5 text-xs font-semibold" style={{ color: '#9B8FA0' }}>
                  {p.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── CTA / APPLY — newsletter banner ── */}
      <Reveal variant="rise">
      <section id="apply" className="py-20 px-4 md:px-8" style={{ background: '#FFFFFF' }}>
        <div
          className="max-w-[1440px] mx-auto relative overflow-hidden rounded-[2.5rem]"
          style={{
            background:
              'radial-gradient(ellipse 55% 90% at 88% 12%, #E3F5FE 0%, transparent 60%), radial-gradient(ellipse 45% 70% at 72% 95%, #E3F5FE 0%, transparent 55%), #FFFFFF',
            border: '2px solid #E3F5FE',
            boxShadow: '0 12px 40px rgba(146,219,253,0.35)',
          }}
        >
          {/* doodles */}
          <svg className="absolute z-10" style={{ top: 22, right: 26 }} width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <path d="M15 3 L18 11 L26 11 L20 16 L22 24 L15 19.5 L8 24 L10 16 L4 11 L12 11 Z" fill="none" stroke="#F5C542" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <svg className="absolute z-10 hidden md:block" style={{ top: '30%', left: '46%' }} width="22" height="20" viewBox="0 0 24 22" aria-hidden="true">
            <path d="M12 19 C6 14.5 4 10.5 6.2 8 C8 6 11 6.5 12 8.6 C13 6.5 16 6 17.8 8 C20 10.5 18 14.5 12 19 Z" fill="#92DBFD" opacity="0.75" />
          </svg>
          <svg className="absolute z-10 hidden md:block" style={{ bottom: 16, right: '16%' }} width="46" height="20" viewBox="0 0 46 20" aria-hidden="true">
            <ellipse cx="16" cy="13" rx="14" ry="6.5" fill="#E3F5FE" />
            <ellipse cx="30" cy="10" rx="11" ry="5.5" fill="#E3F5FE" />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,42%)_1fr] items-stretch">
            {/* baby photo, blended into the card */}
            <div className="relative h-52 md:h-auto" style={{ minHeight: 200 }}>
              <img
                src="/images/look.jpg"
                alt="Happy baby in soft clothing"
                className="mask-fade-r absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '50% 32%' }}
              />
            </div>

            {/* content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-10 md:px-12">
              <h2
                className="mb-2"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#123F58', fontSize: 'clamp(1.7rem, 3vw, 2.3rem)' }}
              >
                Join Our Newsletter
              </h2>
              <p className="text-sm mb-7 font-medium" style={{ color: '#9B8FA0' }}>
                Get the latest collections, special offers and updates.
              </p>

              {submitted ? (
                <div
                  className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl"
                  style={{ background: '#F3FAFF', border: '2px solid #E3F5FE' }}
                >
                  <span className="text-3xl">🎉</span>
                  <div className="text-left">
                    <div className="text-sm font-bold" style={{ color: '#3D3540' }}>You&apos;re on the list!</div>
                    <div className="text-xs font-medium" style={{ color: '#9B8FA0' }}>We&apos;ll be in touch within 1 business day 💌</div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-md flex items-center rounded-full p-1.5"
                  style={{ background: '#fff', border: '2px solid #E3F5FE', boxShadow: '0 8px 28px rgba(146,219,253,0.45)' }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-full text-sm font-medium outline-none"
                    style={{ background: 'transparent', color: '#3D3540' }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                    style={{ background: '#92DBFD', color: '#0E4E6E' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#5FC4F2')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#92DBFD')}
                  >
                    Subscribe →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      </Reveal>

        {/* ── FOOTER — pastel clouds (reference layout) ── */}
      <footer className="relative overflow-hidden" style={{ background: "#FFFFFF url('/images/figma/footer-clouds.png') bottom center / 100% auto no-repeat" }}>
        {/* right-edge doodles */}
        <svg className="absolute pointer-events-none" style={{ top: 30, right: 24 }} width="26" height="24" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M12 19 C6 14.5 4 10.5 6.2 8 C8 6 11 6.5 12 8.6 C13 6.5 16 6 17.8 8 C20 10.5 18 14.5 12 19 Z" fill="none" stroke="#F48FB1" strokeWidth="2" />
        </svg>
        <svg className="absolute pointer-events-none" style={{ top: 70, right: 58 }} width="24" height="24" viewBox="0 0 30 30" aria-hidden="true">
          <path d="M15 3 L18 11 L26 11 L20 16 L22 24 L15 19.5 L8 24 L10 16 L4 11 L12 11 Z" fill="none" stroke="#F5C542" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <svg className="absolute pointer-events-none" style={{ top: 118, right: 26 }} width="20" height="18" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M12 19 C6 14.5 4 10.5 6.2 8 C8 6 11 6.5 12 8.6 C13 6.5 16 6 17.8 8 C20 10.5 18 14.5 12 19 Z" fill="#92DBFD" opacity="0.85" />
        </svg>
        <svg className="absolute pointer-events-none hidden md:block" style={{ bottom: 150, right: 40 }} width="18" height="16" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M12 19 C6 14.5 4 10.5 6.2 8 C8 6 11 6.5 12 8.6 C13 6.5 16 6 17.8 8 C20 10.5 18 14.5 12 19 Z" fill="#C9B6F0" opacity="0.9" />
        </svg>

        {/* content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 pt-10 pb-32 lg:pb-36">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.5fr] gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{ background: '#92DBFD' }}
                >
                  🍼
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#123F58' }}>
                  Tiny<span style={{ color: '#2E9BD6' }}>Threads</span>
                </span>
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#9B8FA0' }}>
                Wholesale Baby Clothing
              </div>
              <p className="text-sm leading-relaxed font-medium mb-5" style={{ color: '#6E7A8A' }}>
                Adorable clothes for brighter tomorrows. Premium quality baby clothing at wholesale prices for retailers and growing businesses.
              </p>
              <div className="flex gap-2">
                {['f', 'ig', 'pin', 'yt', 'tt'].map((s) => (
                  <span
                    key={s}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold cursor-default"
                    style={{ background: '#3D3540', color: '#fff' }}
                    title="Social links — add yours"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {[
              { heading: 'Quick Links', links: [['Home', '/'], ['Products', '/catalog'], ['Categories', '/catalog'], ['Wholesale', '/register'], ['About Us', '#how'], ['Contact', '/register']] },
              { heading: 'Categories', links: [['Rompers & Onesies', '/catalog'], ['Sleepwear Sets', '/catalog'], ['Seasonal Sets', '/catalog'], ['Accessories', '/catalog'], ['All Products', '/catalog']] },
              { heading: 'Support', links: [['FAQs', '#how'], ['Shipping', '#how'], ['Returns', '#how'], ['Size Guide', '/catalog'], ['Wholesale Inquiry', '/register'], ['Contact Us', '/register']] },
            ].map((col) => (
              <div key={col.heading}>
                <div className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: '#123F58' }}>
                  {col.heading}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map(([link, href]) => (
                    <li key={link}>
                      <a
                        href={href}
                        className="text-sm font-medium transition-colors"
                        style={{ color: '#6E7A8A' }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#6E7A8A')}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Get Wholesale Pricing */}
            <div>
              <div className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#123F58' }}>
                Get Wholesale Pricing
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: '#6E7A8A' }}>
                Create an account to access special wholesale rates and new collections.
              </p>
              <a
                href="/register"
                className="inline-block px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all"
                style={{ background: '#F27D9D', boxShadow: '0 6px 18px rgba(242,125,157,0.4)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E76A8D')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#F27D9D')}
              >
                Get Started →
              </a>
              <div className="text-sm font-bold mt-7 mb-3" style={{ fontFamily: 'var(--font-display)', color: '#123F58' }}>
                Payment Methods
              </div>
              <div className="flex flex-wrap gap-2">
                {['VISA', 'Mastercard', 'PayPal', 'Stripe'].map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white"
                    style={{ color: '#123F58', boxShadow: '0 2px 8px rgba(51,65,92,0.12)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar over the clouds */}
        <div className="absolute bottom-3 left-0 right-0 z-10">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold" style={{ color: '#3E6480' }}>
            <span>© {new Date().getFullYear()} TinyThreads. All rights reserved.</span>
            <span className="flex items-center gap-3">
              <a href="#how" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Privacy Policy</a>
              <span>|</span>
              <a href="#how" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Terms of Service</a>
              <span>|</span>
              <Link href="/catalog" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Sitemap</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}