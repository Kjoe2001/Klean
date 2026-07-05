export type PlanKey = 'trial'|'weekly'|'starter'|'pro'|'studio'|'agency'|'enterprise';

/* Credit costs per action — images cost more (they cost real money on Replicate) */
export const CREDIT_COST: Record<string, number> = {
  text: 1,        // any text/content generation
  image: 3,       // one AI image
  campaign: 4,    // full campaign build
  score: 1,       // AI scoring pass
  intel: 2,       // trends / competitor research
};

export const PLANS: Record<PlanKey, any> = {
  trial:  { name:'Free Trial', price:0, days:7, credits:30, tagline:'7 days · 30 credits',
    perks:['30 credits to explore','Hooks, Posts & Captions','A few AI images','Upgrade anytime'],
    features:{ contentTypes:['hooks','post','caption'], images:true, exports:false, trends:false, score:false, campaigns:false, competitors:false, clients:false, seats:1, brands:1 } },
  weekly: { name:'Weekly', price:10, days:7, credits:150, tagline:'$10/week · 150 credits', popular:true,
    perks:['150 credits','All 16 content types','AI Image Studio','PDF + PowerPoint export','Perfect for a campaign sprint'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:false, clients:false, seats:1, brands:2 } },
  starter:{ name:'Starter', price:19, days:30, credits:400, tagline:'Monthly · 400 credits',
    perks:['400 credits / month','All 16 content types','AI Image Studio','PDF + PowerPoint export','1 brand workspace'],
    features:{ contentTypes:'all', images:true, exports:true, trends:false, score:false, campaigns:false, competitors:false, clients:false, seats:1, brands:1 } },
  pro:    { name:'Pro', price:49, days:30, credits:1200, tagline:'Monthly · 1,200 credits',
    perks:['1,200 credits / month','AI scoring & virality','Trend discovery','Campaign Builder','5 brands'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:false, clients:false, seats:1, brands:5 } },
  studio: { name:'Studio', price:99, days:30, credits:3000, tagline:'Monthly · 3,000 credits',
    perks:['3,000 credits / month','Competitor intelligence','Client portal','3 team seats','Unlimited brands'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:3, brands:999 } },
  agency: { name:'Agency', price:249, days:30, credits:9000, tagline:'Monthly · 9,000 credits',
    perks:['9,000 credits / month','10 team seats','White-label exports','Priority generation','Approval workflows'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:10, brands:999 } },
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
