# ZELVO — Africa's AI Marketing Operating System (V2)

Production Next.js 15 SaaS: 16-type AI content engine, AI Image Studio, Campaign Builder,
Trends & Competitor intelligence, Brand Kits, Calendar, Workspaces, Client Portal,
Flutterwave billing (card + MTN MoMo + Telecel + AirtelTigo + bank transfer), and an Admin panel.

## Stack
Next.js 15 (App Router) | TypeScript | Tailwind | Supabase (Auth + Postgres + Storage) |
Anthropic Claude (server-side) | Flutterwave | Vercel

## 1. Local setup
```bash
npm install
cp .env.example .env.local      # fill every value
npm run dev                     # http://localhost:3000
```

## 2. Supabase setup (one time)
1. Create a project at supabase.com -> copy URL + anon key + service role key into `.env.local`.
2. SQL Editor -> paste & run `supabase/schema.sql` (18 tables, RLS, triggers, admin_stats RPC).
3. Storage -> create a **public** bucket named `brand-assets` (Brand Kit logos).
4. Authentication -> Providers -> enable **Google** and **Azure (Microsoft)**:
   - Google: console.cloud.google.com -> OAuth Client (Web) -> redirect URI
     `https://YOUR-REF.supabase.co/auth/v1/callback` -> paste Client ID/Secret into Supabase.
   - Azure: portal.azure.com -> App registrations -> same redirect URI -> paste into Supabase.
5. Authentication -> URL Configuration -> set Site URL to your production domain.

## 3. Flutterwave setup
1. dashboard.flutterwave.com -> Settings -> API -> copy public + secret keys.
2. Settings -> Webhooks -> URL: `https://YOUR-DOMAIN/api/flutterwave/webhook`,
   set a **secret hash** and put the same value in `FLW_WEBHOOK_HASH`.
3. Test mode first (FLW test cards / test MoMo), then switch to live keys.

## 4. Deploy to Vercel
```bash
npx vercel
```
Add all `.env.example` variables in Vercel -> Settings -> Environment Variables.
Set `NEXT_PUBLIC_APP_URL` to the production URL. Add your email to `ADMIN_EMAILS`
and set your profile `role` to `admin` in the profiles table to unlock /admin.

## Key routes
Marketing: / /pricing /about /contact /privacy /terms /refund-policy /cookies
Auth: /signup /login /forgot-password /reset-password
App: /dashboard /content-studio /campaign-builder /image-studio /brand-kit
/calendar /library /trends /competitors /analytics /workspaces /clients
/billing /checkout /payment-success /payment-failed /settings /admin
API: /api/generate /api/score /api/intel /api/flutterwave/{initiate,webhook,verify} /api/admin/stats

## Security model
- ANTHROPIC + FLW secret keys live **server-side only** — never shipped to the browser.
- Postgres Row Level Security on every table: users only ever see their own rows.
- Webhook verified with `verif-hash`; payments re-verified server-to-server on redirect.
- Admin stats RPC revoked from anon/authenticated; only the service-role API route calls it.

See **STATUS.md** for what's production-ready vs. v1 stubs.
