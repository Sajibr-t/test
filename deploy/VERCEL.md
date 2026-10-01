# Hosting on Vercel + Turso (free, no card)

Vercel runs the site. Turso stores the database: it's hosted SQLite, so the schema is unchanged. The app uses Turso whenever `TURSO_DATABASE_URL` is set. Locally it keeps using `prisma/dev.db`.

> Vercel's free Hobby plan is for non-commercial use. Once the store takes real orders, Vercel expects the Pro plan.

## 1. Create the Turso database

1. Sign up at https://turso.tech with your GitHub account.
2. **Create Database**. Pick the location closest to your customers, such as Singapore.
3. On the database page, copy the **URL** (`libsql://...turso.io`) and create a **token** (read & write).
4. In the project folder, create a file named `.env.turso`. It's already ignored by git.
   ```
   TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
   TURSO_AUTH_TOKEN="your-token"
   ```
5. Create the tables and copy your current products and photos. Accounts and orders are never copied.
   ```
   npm run turso:migrate -- --copy-catalogue
   ```
   Leave out `--copy-catalogue` to start with an empty catalogue.
6. Create your admin login:
   ```
   node --env-file=.env.turso deploy/create-admin.cjs
   ```

## 2. Deploy on Vercel

1. Sign up at https://vercel.com with GitHub. **Add New → Project** and import `Cloth_Web_APP`. Allow Vercel access to the private repo when asked.
2. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `TURSO_DATABASE_URL` | from step 1 |
   | `TURSO_AUTH_TOKEN` | from step 1 |
   | `DATABASE_URL` | `file:./unused.db` (required by the schema; not used when Turso is set) |
   | `SESSION_SECRET` | run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
   | `JOBS_SECRET` | run the same command again for a different value |
   | `SITE_URL` | leave for now |
   | `RESEND_API_KEY`, `EMAIL_FROM` | optional, for emails (see below) |

3. Click **Deploy**. You'll get a link like `https://cloth-web-app.vercel.app`.
4. Set `SITE_URL` to that link under **Settings → Environment Variables**, then redeploy from **Deployments → ⋯ → Redeploy**.
5. Optional, for speed: under **Settings → Functions → Region**, pick the region nearest your Turso database.

Every push to `main` now redeploys automatically. If a change adds a migration, run `npm run turso:migrate` before pushing.

## 3. Emails

Account verification, password resets and order updates need a Resend account (https://resend.com, free tier) with a verified sender. Add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel.

Queued emails are sent when something calls `/api/jobs/email`. Vercel's free cron only runs once a day, so use https://cron-job.org (free, no card):
- URL: `https://YOUR-SITE/api/jobs/email`
- Schedule: every minute
- Request method: **POST**
- Header: `Authorization` = `Bearer YOUR_JOBS_SECRET`

You can also send queued emails by hand from **Admin → Emails**.

## Notes

- `npm run db:backup` and `npm run check:launch` read the local SQLite file only. For Turso, use the backup and restore options in the Turso dashboard.
- Don't put the Turso variables in your local `.env`: `npm run dev` would then write to the live database.
