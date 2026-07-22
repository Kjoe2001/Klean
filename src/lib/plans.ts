export type PlanKey = 'trial'|'weekly'|'starter'|'pro'|'studio'|'agency'|'enterprise';

/* Credit costs per action */
export const CREDIT_COST: Record<string, number> = {
  text: 1,        // any text/content generation
  campaign: 2,    // full campaign build
  score: 1,       // AI scoring pass
  intel: 1,       // trends / competitor research
  image: 8,       // AI image generation (Flux 1.1 Pro Ultra)
};

export const PLANS: Record<PlanKey, any> = {
  trial:  { name:'Free Trial', price:0, days:7, credits:50, tagline:'7 days · 50 credits',
    perks:['50 credits to explore','All text tools unlocked','Upgrade anytime'],
    features:{ contentTypes:'all', images:false, exports:false, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:1 } },
  weekly: { name:'Weekly', price:1.61, days:7, credits:100, tagline:'GH₵25/week · 100 credits', popular:true,
    perks:['100 credits','All text tools unlocked','PDF + PowerPoint export','Perfect for a campaign sprint'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:2 } },
  starter:{ name:'Starter', price:5.03, days:7, credits:150, tagline:'GH₵78/week · 150 credits',
    perks:['150 credits / week','All text tools unlocked','PDF + PowerPoint export','1 brand workspace'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:1 } },
  pro:    { name:'Pro', price:24, days:30, credits:800, tagline:'Monthly · 800 credits',
    perks:['800 credits / month','AI scoring & virality','Trend discovery','Campaign Builder','5 brands'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:false, seats:1, brands:5 } },
  studio: { name:'Studio', price:49, days:30, credits:2000, tagline:'Monthly · 2,000 credits',
    perks:['2,000 credits / month','Competitor intelligence','Client portal','3 team seats','Unlimited brands'],
    features:{ contentTypes:'all', images:false, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:3, brands:999 } },
  agency: { name:'Agency', price:99, days:30, credits:6000, tagline:'Monthly · 6,000 credits',
    perks:['6,000 credits / month','10 team seats','White-label exports','Priority generation','Approval workflows'],
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
