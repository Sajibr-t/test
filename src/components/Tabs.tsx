'use client'

import { Children, useState } from 'react'

/* Kyte-style section tabs: heading left, tab links right on a hairline rule,
   optional big centered tagline; panes are server-rendered and toggled here */
export default function Tabs({
  heading,
  tagline,
  labels,
  children,
}: {
  heading?: string
  tagline?: string
  labels: string[]
  children: React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const panes = Children.toArray(children)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 border-b border-stone-200">
        {heading && (
          <h2 className="pb-3 text-2xl font-bold text-ink">{heading}</h2>
        )}
        <div className="flex flex-wrap gap-6 text-sm font-semibold">
          {labels.map((l, i) => (
            <button
              key={l}
              onClick={() => setActive(i)}
              className={
                i === active
                  ? '-mb-px border-b-2 border-ink pb-3 text-ink'
                  : '-mb-px border-b-2 border-transparent pb-3 text-stone-400 transition hover:text-ink'
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {tagline ? (
        <div className="py-9 text-center text-3xl font-semibold text-ink md:text-4xl">
          {tagline}
        </div>
      ) : (
        <div className="pt-8" />
      )}
      {panes.map((p, i) => (
        <div key={i} hidden={i !== active}>
          {p}
        </div>
      ))}
    </div>
  )
}
