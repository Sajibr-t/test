# Wholesale Clothing Co. — B2B Store

A wholesale (B2B) clothing ecommerce store built with Next.js, TypeScript, Tailwind CSS, and Prisma (SQLite).

## Running the store

```bash
npm run dev       # development server at http://localhost:3000
npm run build     # production build
npm start         # run the production build
```

## Test accounts (seeded)

| Role  | Email             | Password | Notes                          |
| ----- | ----------------- | -------- | ------------------------------ |
| Admin | admin@example.com | admin123 | Full admin dashboard access    |
| Buyer | buyer@example.com | buyer123 | Pre-approved demo trade buyer  |

**Change these before going live.**

## How it works

- **Buyer approval** — retailers apply at `/register`, land in PENDING status,
  and only see wholesale prices after an admin approves them at `/admin/buyers`.
- **Tiered pricing** — each product has a base unit price plus quantity breaks
  (e.g. 48+ units → cheaper). Breaks apply to the *total* units of a style in
  the cart, packs and loose sizes combined.
- **Prepacks / size runs** — products can define prepacks (e.g. 1S-2M-2L-1XL);
  buyers order whole packs or top up individual sizes.
- **MOQs** — each product has a minimum order quantity; the cart blocks
  checkout until every style in it meets its MOQ.
- **Invoicing** — placing an order generates a Net-30 invoice (no card
  payment). Buyers can print / save it as PDF from the order page. Admins mark
  invoices paid at `/admin/orders`.

## Key files

- `prisma/schema.prisma` — data model (users, products, variants, packs, price breaks, orders, invoices)
- `prisma/seed.js` — seed data (`node prisma/seed.js`)
- `src/lib/` — session auth, cart + pricing engine, formatting
- `src/app/actions/` — all server actions (auth, cart/orders, admin)
- `src/app/admin/` — admin dashboard pages
- `src/lib/format.ts` — change `CURRENCY` / `LOCALE` here

## Before going live

1. Change the seeded admin password (or delete and recreate the admin user).
2. Set a strong `SESSION_SECRET` in `.env`.
3. Switch the datasource in `prisma/schema.prisma` from `sqlite` to
   `postgresql` and point `DATABASE_URL` at a hosted Postgres database, then
   run `npx prisma migrate deploy`.
4. Deploy (Vercel, Railway, or any Node host).

## Not yet implemented (next steps)

- Product images
- Per-buyer price tiers (different price lists per customer group)
- Stock enforcement (stock is tracked but informational only)
- Email notifications (application approved, order confirmed)
- Online payment option alongside invoice terms
