# Launch and operations

## Application setup

1. Use Node 24 (the maintenance and test scripts use `node:sqlite`). Install with `npm ci`.
2. Configure the variables in `.env.example`. Keep secrets out of source control.
3. Run `npm run db:backup` before changing an existing database, then `npm run db:deploy` and `npx prisma generate`.
4. Complete `/admin/settings`: business/support details, permitted delivery countries, flat delivery fee in MYR, tax percentage, invoice payment instructions, and your reviewed policy text.
5. Load real products/photos and stock. Replace the demonstration accounts. Enable checkout only after checking the settings.
6. Run `npm test`, `npm run lint`, `npm run build`, then `npm run check:launch`.
7. Run `npm start` behind HTTPS. `node scripts/review-launch.cjs` tests a production build against a newly created temporary database and never sends email.

## Database and hosting

The current schema and migrations use SQLite. Use a persistent disk and a single application instance for this deployment. A disposable serverless filesystem is unsuitable. Database product images are included in the same backups. The database path is relative to `prisma/` unless absolute.

Do not merely change the provider to PostgreSQL: the SQLite migration history cannot be deployed to PostgreSQL. A PostgreSQL move needs a separate baseline and a reviewed data transfer. The deploy script also reconciles the earlier manually added product translation columns without dropping data.

Schedule `npm run db:backup`, copy the backup to private off-host storage and test restoring it to a separate instance. The backup script uses SQLite `VACUUM INTO` for a consistent copy; it never deletes older backups. Restrict access to backups because they contain customer information.

## Email delivery

Configure `RESEND_API_KEY`, a verified `EMAIL_FROM`, and the public `SITE_URL`. The adapter uses the [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email) and [idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

Schedule a POST to `/api/jobs/email` every minute with `Authorization: Bearer <JOBS_SECRET>` using your hosting scheduler. Each request attempts up to ten emails. The admin email queue can also process a batch. No scheduler or live provider account has been created by this implementation.

Messages are queued in the same database transaction as orders/status updates, and a temporary provider failure does not fail checkout. Successful sends clear the body from the local queue. Failed sends retry up to five times. Delayed uncertain retries require manual provider-log review to avoid duplicates beyond the provider's deduplication window. Monitor FAILED, SENDING and REVIEW messages. Queued recovery links still expire normally; request a new link if delivery was delayed.

## Launch checks outside this repository

- Public domain/HTTPS, email-domain verification and an actual inbox delivery test.
- Business confirmation of flat-rate shipping, tax treatment and invoice terms. The configured tax applies to merchandise plus shipping.
- Final business and policy content. Empty pages are deliberately marked as unfinished.
- Hosting uptime/error monitoring, private backup storage and a restore drill.
- Keep dependency audits current. A scoped `@prisma/config` override pins `deepmerge-ts` to 8.0.0 to address [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx). Prisma uses its named `deepmerge` export for configuration objects; schema validation, generation and migration commands were verified with the override. Remove the override when Prisma adopts a patched version upstream. The final npm audit reports zero vulnerabilities.

## Current boundaries

- Payment remains manual Net 30. Card payments, refunds, partial payments and credit notes are not automated.
- Unpaid, unshipped orders may be cancelled; recorded allocations are restored once and the invoice is voided. Paid or shipped orders need a separate reviewed return/refund process and cannot be cancelled through the status control.
- Historical orders created before these migrations have no stock allocations or address snapshots; the app does not invent either. New orders have permanent snapshots.
- Authenticated carts are saved per buyer. Old browser-only carts are not automatically imported into accounts.
- One photo per product, a flat shipping fee and one tax percentage are supported. Multiple warehouses, multiple product photos, regional rates, and buyer-specific price lists are future extensions.
