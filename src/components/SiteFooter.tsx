'use client'

/* Shared pastel-clouds footer — same design as the landing page footer.
   Keep in sync with the footer block in Landing.tsx. */
export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden print:hidden" style={{ background: "#FFFFFF url('/images/figma/footer-clouds.png') bottom center / 100% auto no-repeat" }}>
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
            { heading: 'Quick Links', links: [['Home', '/'], ['Products', '/catalog'], ['Categories', '/catalog'], ['Wholesale', '/register'], ['About Us', '/#how'], ['Contact', '/register']] },
            { heading: 'Categories', links: [['Rompers & Onesies', '/catalog'], ['Sleepwear Sets', '/catalog'], ['Seasonal Sets', '/catalog'], ['Accessories', '/catalog'], ['All Products', '/catalog']] },
            { heading: 'Support', links: [['FAQs', '/#how'], ['Shipping', '/#how'], ['Returns', '/#how'], ['Size Guide', '/catalog'], ['Wholesale Inquiry', '/register'], ['Contact Us', '/register']] },
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
            <a href="/#how" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Privacy Policy</a>
            <span>|</span>
            <a href="/#how" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Terms of Service</a>
            <span>|</span>
            <a href="/catalog" className="transition-colors" onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F27D9D')} onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#3E6480')}>Sitemap</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
