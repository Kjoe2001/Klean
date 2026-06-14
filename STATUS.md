# ZELVO V2 — Build Status

## Production-ready
- Auth: email + Google + Microsoft OAuth, forgot/reset password, profile auto-creation trigger
- Plans: trial(7d, 3 types) / Starter $19 / Pro $49 / Studio $99 / Agency $249 / Enterprise — gating enforced everywhere
- Content Studio: 16 types, parallel generation, Brand-Kit injection, AI scoring (virality/engagement/readability/brand-fit), auto-save to Library, inline AI images
- AI engine: server-side Claude (claude-sonnet-4-6); Trends + Competitors use live web search
- Image Studio: 9 modes x 7 sizes, download / regenerate / edit prompt, saved to DB
- Brand Kit: CRUD + logo upload to Supabase Storage + colors/fonts/tone/guidelines
- Campaign Builder: strategy / media plan / KPI forecast / budget allocation / timeline -> campaigns table
- Library: search, type filter, copy, delete · Calendar: month grid, drag-drop reschedule
- Billing: Flutterwave hosted checkout (card, MTN MoMo, Telecel, AirtelTigo, transfer, USSD), signed webhook, server re-verification, plan activation, payments/transactions/invoices/subscriptions, upgrade/downgrade/cancel, history
- Admin: users/MRR/revenue/churn/plan bars/recent payments, ADMIN_EMAILS gate
- 6 legal pages with real Ghana-relevant copy · dark/light mode · glassmorphism system

## V1 stubs (UI present, integration pending)
| Feature | Current | Production path |
|---|---|---|
| Social auto-publish | Calendar stores schedules | Per-network app review + OAuth; start with Meta Graph API |
| Analytics connections | Paste-metrics -> AI insights works | Platform OAuth + nightly sync into analytics table |
| Workspace email invites | Add by user ID | Resend email invites + pending_invites table |
| Client share/approvals | Buttons present | Public /share/[token] routes + approval states |
| Recurring billing | Charge on upgrade; webhook ready | FLW Payment Plans for true auto-renew |
| Word/Excel/PNG export | PDF+PPTX shipped in v1 web pack | jsPDF/PptxGenJS already in deps — wire in Library |

## Launch sequence
1. Deploy -> FLW test mode end-to-end (trial -> checkout -> webhook -> plan active)
2. Seed 2-3 Brand Kits, generate demo content for screenshots
3. Launch Starter/Pro; enable Studio/Agency when first agencies onboard
