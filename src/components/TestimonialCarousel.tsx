'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export type Testimonial = {
  img: string
  title: string
  quote: string
  who: string
  product: { name: string; price: string; img: string | null; href: string }
}

/* Kyte-style testimonial carousel: overflowing wide cards (photo | quote panel),
   round product chip, side arrows, thin scroll-progress line */
export default function TestimonialCarousel({
  items,
}: {
  items: Testimonial[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [prog, setProg] = useState(0)
  const [ratio, setRatio] = useState(0.5)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth
      setProg(max > 0 ? el.scrollLeft / max : 0)
      setRatio(el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1)
    }
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  /* drag-to-scroll so mouse users can swipe the cards */
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const onDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !drag.current.down) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 5) drag.current.moved = true
    el.scrollLeft = drag.current.left - dx
  }
  const onUp = () => {
    drag.current.down = false
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={onClickCapture}
        className="flex cursor-grab select-none gap-6 overflow-x-auto rounded-2xl px-[6%] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing md:px-[9%]"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((t) => (
          <div
            key={t.title}
            className="grid h-[520px] w-[88%] shrink-0 overflow-hidden rounded-xl sm:h-[480px] sm:grid-cols-2 md:h-[520px] md:w-[82%]"
            style={{ scrollSnapAlign: 'center' }}
          >
            <div className="relative hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex min-h-0 flex-col bg-[#DCEBF8] p-8 md:p-10">
              <div className="tracking-widest text-ink">★★★★★</div>
              <div className="mt-4 text-2xl font-semibold text-ink">
                {t.title}
              </div>
              <p className="mt-3 max-w-md leading-relaxed text-stone-600">
                {t.quote}
              </p>
              <div className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-stone-500">
                {t.who}
              </div>
              <Link
                href={t.product.href}
                className="mt-auto flex items-center gap-4 pt-8 transition hover:opacity-70"
              >
                <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
                  {t.product.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.product.img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {t.product.name}
                  </span>
                  <span className="mt-0.5 block text-xs uppercase tracking-wide text-stone-500">
                    {t.product.price}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* scroll progress line */}
      <div className="relative mx-auto mt-10 h-px w-[min(90%,1100px)] bg-stone-200">
        <div
          className="absolute -top-px h-[3px] bg-ink transition-[left,width] duration-150"
          style={{
            width: `${ratio * 100}%`,
            left: `${prog * (1 - ratio) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
