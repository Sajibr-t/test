# TinyThreads — Wholesale Baby & Kids Clothing Store

A B2B (wholesale) clothing storefront built with **Next.js 16**, **TypeScript**,
**Tailwind CSS v4** and **Prisma** (SQLite in development).

Retailers apply for a trade account, an admin approves them, and only then do
they see wholesale prices. Orders are placed on **Net 30 invoice terms** rather
than card payment, which is how wholesale trade accounts normally work.

---

## Getting started

```bash
npm install
npm run db:migrate    # create the local SQLite database
npm run db:seed       # add demo products + test accounts
npm run dev           # http://localhost:3000
```

You need a `.env` file in the project root (see `.env.example`):

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="a-long-random-string"
```

### Test accounts (created by the seed)

| Role  | Email             | Password | Notes                         |
| ----- | ----------------- | -------- | ----------------------------- |
| Admin | admin@example.com | admin123 | Full admin dashboard access   |
| Buyer | buyer@example.com | buyer123 | Pre-approved demo trade buyer |

**Change these before going live.**

---

## Folder structure

```
prisma/
  schema.prisma          Data model: users, products, variants, packs,
                         price breaks, orders, invoices
  migrations/            Database migration history
  seeds/                 Demo data scripts (seed.js, seed-kids.js, seed-baby.js)

public/
  images/                Product photos and banners

scripts/
  screenshots/           Dev-only Playwright helpers for capturing pages

src/
  app/                   Next.js App Router — URLs live here
    page.tsx             "/" landing page
    layout.tsx           Root layout: fonts + global CSS
    globals.css          Theme tokens (brand colours, fonts)
    actions/             Server actions ("use server")
      auth.ts            register / login / logout
      cart.ts            add, remove, place order
      admin.ts           approve buyers, manage catalogue and orders
    (shop)/              Route group sharing the shop header + footer.
                         The parentheses mean it adds NO path segment:
                         (shop)/cart/page.tsx serves "/cart".
      layout.tsx         Shop header, mega menu, footer
      catalog/           Shop pages: listing + product detail
      baby/              Filterable baby listing with sidebar facets
      cart/              Cart and checkout
      orders/            Buyer order history + printable invoice
      admin/             Admin area (buyers, products, orders)
      login/ register/ pending/

  components/
    home/                Landing page
    layout/              Site chrome (footer)
    shop/                Shop-specific UI (carousels, tabs)
    ui/                  Small shared pieces (badges, icons, buttons)

  lib/                   Business logic, framework-independent
    db.ts                Shared Prisma client
    session.ts           Auth: JWT cookie sessions + access gates
    cart.ts              Cart cookie + cart pricing
    pricing.ts           Quantity-break and prepack maths
    format.ts            Money and date formatting
    display.ts           Product image / emoji fallbacks
```

**Where to change things**

| I want to...                     | Go to                                |
| -------------------------------- | ------------------------------------ |
| Change the currency              | `src/lib/format.ts`                  |
| Change brand colours or fonts    | `src/app/globals.css`                |
| Change how discounts are applied | `src/lib/pricing.ts`, `src/lib/cart.ts` |
| Change who can see what          | `src/lib/session.ts`                 |
| Add a product photo              | `public/images/` + `src/lib/display.ts` |
| Change the landing page          | `src/components/home/Landing.tsx`    |
| Change the shop header/footer    | `src/app/(shop)/layout.tsx`, `src/components/layout/` |

---

## How the wholesale logic works

- **Buyer approval** — retailers apply at `/register` and land in `PENDING`.
  They only see trade prices once an admin approves them at `/admin/buyers`.
- **Quantity breaks** — each product has a base unit price plus breaks
  (e.g. 48+ units is cheaper). Breaks apply to the **total** units of a style
  in the cart, prepacks and loose sizes combined.
- **Prepacks / size runs** — a product can define a balanced size run
  (e.g. 1×2-3Y, 2×4-5Y, 1×6-7Y). Buyers order whole packs or top up single sizes.
- **MOQs** — every product has a minimum order quantity. Checkout is blocked
  (server-side, not just in the UI) until each style meets its MOQ.
- **Invoicing** — placing an order generates a Net 30 invoice. Buyers can print
  or save it as PDF; admins mark invoices paid at `/admin/orders`.

Money is stored everywhere as **integer cents** to avoid rounding drift.
Order line items store a price snapshot, so historic invoices stay correct even
after products are renamed or repriced.

---

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm start            # serve the production build
npm run lint         # eslint
npm run db:migrate   # apply migrations to the local database
npm run db:seed      # load demo catalogue + accounts
npm run db:studio    # browse the database in Prisma Studio
```

---

## Before going live

1. Change the seeded admin password (or delete and recreate the admin user).
2. Set a strong random `SESSION_SECRET` in `.env` — the dev fallback is not secret.
3. Switch `prisma/schema.prisma` from `sqlite` to `postgresql`, point
   `DATABASE_URL` at a hosted database, then run `npx prisma migrate deploy`.
4. Deploy to Vercel, Railway, or any Node host.

`.env` and the local `dev.db` are gitignored and must never be committed —
the database contains buyer accounts and password hashes.

---

## Not yet implemented

- Per-buyer price tiers (different price lists per customer group)
- Stock enforcement (stock is tracked but does not block ordering)
- Email notifications (approval, order confirmation)
- Online payment option alongside invoice terms
