export type PlanKey = 'trial'|'weekly'|'starter'|'pro'|'studio'|'agency'|'enterprise';

/* Credit costs per action */
export const CREDIT_COST: Record<string, number> = {
  text: 1,        // any text/content generation
  campaign: 2,    // full campaign build
  score: 1,       // AI scoring pass
  intel: 1,       // trends / competitor research
  design: 4,      // Creative Studio design save
  frame_video: 5, // Video Frame Studio video save
};

// Pricing updated 2026-08-13 — margin-corrected.
// Cost basis: ~$0.012/credit blended AI cost, 2.5% payment processing.
// Target: 65%+ gross margin per credit, no tier below 55%.
// GH₵ taglines use the ~15.5 GH₵/USD rate already baked into this file's weekly/starter tiers.
export const PLANS: Record<PlanKey, any> = {
  trial:  { name:'Free Trial', price:0, days:7, credits:50, tagline:'7 days · 50 credits',
    perks:['50 credits to explore','All text tools unlocked','Upgrade anytime'],
    features:{ contentTypes:'all', images:false, exports:false, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:1 } },
  weekly: { name:'Weekly', price:2.25, days:7, credits:55, tagline:'GH₵35 · 55 credits',
    perks:['55 credits','All text tools unlocked','PDF + PowerPoint export','Perfect for a campaign sprint'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:2 } },
  starter:{ name:'Starter', price:6.10, days:7, credits:165, tagline:'GH₵95 · 165 credits',
    perks:['165 credits','All text tools unlocked','PDF + PowerPoint export','1 brand workspace'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:1 } },
  pro:    { name:'Pro', price:39, days:30, credits:950, tagline:'Monthly · 950 credits', popular:true,
    perks:['950 credits / month','AI scoring & virality','Trend discovery','Campaign Builder','5 brands'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:5 } },
  studio: { name:'Studio', price:69, days:30, credits:2000, tagline:'Monthly · 2,000 credits',
    perks:['2,000 credits / month','Competitor intelligence','Client portal','3 team seats','Unlimited brands'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:3, brands:999 } },
  agency: { name:'Agency', price:149, days:30, credits:5000, tagline:'Monthly · 5,000 credits',
    perks:['5,000 credits / month','10 team seats','White-label exports','Priority generation','Approval workflows'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:10, brands:999 } },
  enterprise:{ name:'Enterprise', price:-1, days:30, credits:999999, tagline:'Custom',
    perks:['Unlimited credits','Unlimited seats','Custom AI training','API access','Dedicated AM','SLA'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:999, brands:999 } },
};
export const can = (plan: PlanKey, f: string) => !!PLANS[plan]?.features?.[f];
export const canType = (plan: PlanKey, t: string) => {
  const ct = PLANS[plan]?.features?.contentTypes;
  return ct === 'all' || (Array.isArray(ct) && ct.includes(t));
};
export const planCredits = (plan: PlanKey) => PLANS[plan]?.credits ?? 0;

// Add-on top-up credit packs (not yet wired into checkout — reference data for the next pass).
export const CREDIT_TOPUPS = [
  { id: 'topup_250', credits: 250, priceUSD: 9.5 },   // $0.038/credit
  { id: 'topup_500', credits: 500, priceUSD: 18 },    // $0.036/credit
  { id: 'topup_1500', credits: 1500, priceUSD: 48 },  // $0.032/credit
];

// Annual billing discount off monthly tiers (not yet wired into checkout).
export const ANNUAL_DISCOUNT = 0.15;
