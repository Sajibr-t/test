# Store completion plan

This is the working implementation checklist for the existing wholesale store.
The existing MYR / English and Malay / Net 30 model stays in place until the owner supplies different business requirements.

1. [x] Inventory: atomic stock deductions for loose sizes and prepacks, duplicate submission protection, safe unpaid cancellations, regression tests.
2. [x] Checkout implementation: required delivery details, immutable billing/delivery snapshots, configurable flat shipping/tax and payment instructions.
3. [x] Accounts: profile editing, saved carts, password changes/recovery, verification, production session protection and rate limits.
4. [x] Operations implementation: durable email queue and Resend adapter, shipment tracking, admin visibility. Live provider and scheduled worker setup remain below.
5. [x] Catalogue and information-page implementation: photo uploads, variant/prepack additions and editing, configurable contact/policy pages, metadata and error pages. Final policy content remains below.
6. [x] Local validation and deployment tooling: production build, isolated database tests, browser checks, backup script and deployment instructions.
7. [ ] Live launch: owner settings, real product data, email service/scheduler, persistent hosting, backups and monitoring.

## Owner setup required before launch

- Confirm selling country/currency, business identity and support contacts.
- Supply shipping areas/prices, tax treatment, payment instructions and policies.
- Supply email delivery credentials and verified sender, public site URL, and hosting/database details.
- Replace demo products/accounts and enter actual stock counts.
- Online card payments remain an optional separate integration; this implementation retains invoice terms.
- Remove demo accounts before launch. Paid/shipped returns and refunds still require a separately reviewed operational process.

## Validation log

- Baseline: 7 tests, ESLint and TypeScript passed before implementation.
- Implemented: 18 tests pass, including concurrent orders, stock rollback/restoration, invoice snapshots, reset links and provider retry behavior.
- Production build (including TypeScript) and ESLint pass.
- Isolated production-browser test passes registration, pending access, admin approval, checkout, shipping/tax, invoice snapshots, photo uploads, shipment tracking, password recovery/session invalidation and mobile overflow/image checks.
- All migrations applied to the local database without resetting its data.
- npm audit reports zero vulnerabilities after a scoped deepmerge-ts override; see DEPLOYMENT.md.
- Launch configuration check intentionally reports missing business/email/domain setup and existing demo accounts. This is not a live deployment.

## Site review — 2 October 2026

- Fixed mobile overflow in product administration, order history, invoices and populated order-management forms. Tables scroll within their sections; invoice headings and form controls adapt to narrow screens.
- Rejected malformed language-switch return paths, invalid/duplicate quantity-discount tiers, and inherited object-property names in information-page routes.
- All 20 automated tests pass, including the new redirect and quantity-discount regressions. Production build, TypeScript and application lint pass.
- Production browser checks passed 93 page/viewport combinations at 1440, 390 and 320 pixels, including Malay pages. Four additional checks passed for populated admin order/email screens on mobile; these checks are now included in the browser suite.
- Browser flows passed registration, email verification, approval gates, filtering, checkout, inventory, invoice snapshots, photo upload, fulfilment, password recovery, language switching, mobile navigation and not-found handling. No broken images or client-side exceptions were detected in those checks.
- Checks used isolated test data and queued email; live email delivery and deployment remain unverified until the existing owner setup is completed.
