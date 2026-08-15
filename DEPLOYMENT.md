# Deployment Guide

This covers taking the app from your local machine to a live, public URL.

## Recommended stack for launch
- **Hosting**: Vercel (built by the Next.js team, zero-config for this project, generous free tier)
- **Database**: Neon or Vercel Postgres (both integrate cleanly with Vercel)
- **Domain**: whatever registrar you prefer (Namecheap, GoDaddy, or a UAE-based registrar) pointed at Vercel

You can substitute any Node-hosting provider (Railway, Render, a VPS) — the steps below are Vercel-specific but the environment variables and build steps are the same everywhere.

## 1. Push the code to GitHub
```bash
cd cycling-store
git init
git add .
git commit -m "Initial commit"
```
Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/YOUR-USERNAME/cycling-store.git
git branch -M main
git push -u origin main
```

## 2. Set up production database
If you haven't already, create a **production** Postgres database (separate from your local dev one) — Neon or Vercel Postgres both work. Copy the connection string.

## 3. Deploy to Vercel
1. Go to vercel.com, sign in, click "Add New Project"
2. Import your GitHub repository
3. Vercel auto-detects Next.js — leave build settings as default
4. Before deploying, add environment variables (see list below)
5. Click Deploy

## 4. Environment variables to set in Vercel
Go to Project Settings → Environment Variables and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your production Postgres connection string |
| `AUTH_SECRET` | Generate a **new** one for production: `npx auth secret` — do not reuse your local dev secret |
| `NEXTAUTH_URL` | Your production URL, e.g. `https://cycleuae.com` |
| `NEXT_PUBLIC_SITE_URL` | Same as above, used for sitemap/SEO |
| `PAYMENT_PROVIDER` | `cod` until a real gateway is integrated |
| `SHIPPING_PROVIDER` | `manual` until a real courier API is integrated |

## 5. Run migrations against production
After the first deploy, run this once (from your local machine, pointed at the production `DATABASE_URL`):
```bash
DATABASE_URL="your-production-url" npx prisma db push
```
**Do NOT run `npx prisma db seed` against production** — that creates the placeholder admin account and sample products, which you don't want on a live store. Instead, manually create your real admin account and real products through the `/admin` dashboard once deployed (see step 6).

## 6. Create your real admin account
The seed script's `admin@cycleuae.com` / `Admin1234` login is for **local development only**. For production:
1. Register a normal customer account on your live site with your real email
2. Connect to your production database (`npx prisma studio` pointed at production, or your database provider's dashboard)
3. Find your user row, create a "Super Admin" `Role` if one doesn't exist (the seed script creates these — you may want to run just the role/permission portion manually, or temporarily point `db seed` at production once, then immediately change the placeholder admin's password or delete that one account)
4. Set your user's `roleId` to that Super Admin role

This is clunky by design — first-admin bootstrapping is a common rough edge in early-stage apps. If this friction bothers you, tell me and I'll build a proper one-time setup wizard.

## 7. Point your domain at Vercel
In Vercel → Project Settings → Domains, add your domain and follow the DNS instructions (usually adding an A record or CNAME at your registrar).

## 8. Before going fully live
- [ ] Change/remove the seeded admin account credentials
- [ ] Connect a real payment gateway (see `src/lib/payments/` — Phase 1 open question)
- [ ] Connect a real courier if you want live tracking (see `src/lib/shipping/`)
- [ ] Set up a transactional email provider for password resets (currently just logs to console — see `src/server/actions/auth.ts`)
- [ ] Review and tighten the Content-Security-Policy in `next.config.ts` once you know your final asset domains
- [ ] Set up error monitoring (Sentry or similar) — not included in this build
- [ ] Set up uptime monitoring
- [ ] Test the full purchase flow on the live URL, not just locally
- [ ] Add real product photography (current setup uses URL-based images)

## Rollback plan
Vercel keeps every deployment. If something breaks after a deploy, go to the Deployments tab and click "Promote to Production" on the last known-good one — instant rollback, no code changes needed.
