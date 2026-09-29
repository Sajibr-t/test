/**
 * Auto-advancing promo carousel at the top of the shop page.
 *
 * Slides are built from real discounted products by the catalogue page and
 * passed in, so the banner always advertises offers that actually exist.
 * Client component: it owns the rotation timer and the active-slide state.
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export type OfferSlide = {
  title: string
  sub: string
  cta: string
  href: string
  img?: string | null
  tint: string
}

/* Full-bleed photo hero (Kyte-style): text bottom-left, dash indicators */
export default function OffersSlider({ slides }: { slides: OfferSlide[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  if (slides.length === 0) return null

  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length)
  const onPhoto = !!slides[i].img

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((s, idx) => (
          <div key={idx} className="min-w-full">
            {s.img ? (
              <div className="relative h-[440px] md:h-[540px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-0 mx-auto flex max-w-[1440px] flex-col items-start justify-end px-6 pb-16 md:px-8">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
                    Special offer
                  </div>
                  <h3 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
                    {s.sub}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-6 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-stone-100"
                  >
                    {s.cta}
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="flex h-[440px] items-center md:h-[540px]"
                style={{ background: s.tint }}
              >
                <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400">
                    Wholesale made simple
                  </div>
                  <h3 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-stone-600 md:text-base">
                    {s.sub}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-6 inline-block rounded-lg bg-ink px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    {s.cta}
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous offer"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-ink shadow-sm transition hover:bg-white"
          >
            ‹
          </button>
          <button
            aria-label="Next offer"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-ink shadow-sm transition hover:bg-white"
          >
            ›
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                aria-label={'Go to offer ' + (idx + 1)}
                onClick={() => setI(idx)}
                className="h-[3px] w-10 rounded-full transition"
                style={{
                  background: onPhoto
                    ? idx === i
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.45)'
                    : idx === i
                      ? '#3d3540'
                      : 'rgba(61,53,64,0.3)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
