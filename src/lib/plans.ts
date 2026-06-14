export type PlanKey = 'trial'|'starter'|'pro'|'studio'|'agency'|'enterprise';
export const PLANS: Record<PlanKey, any> = {
  trial:  { name:'Free Trial', price:0,  tagline:'7 days, limited modules',
    perks:['Hooks, Posts & Captions','AI images (10/day)','Copy to clipboard'],
    features:{ contentTypes:['hooks','post','caption'], images:true, exports:false, trends:false, score:false, campaigns:false, competitors:false, clients:false, seats:1, brands:1 } },
  starter:{ name:'Starter', price:19, tagline:'For solo creators',
    perks:['All 16 content types','AI Image Studio','PDF + PowerPoint export','1 brand workspace'],
    features:{ contentTypes:'all', images:true, exports:true, trends:false, score:false, campaigns:false, competitors:false, clients:false, seats:1, brands:1 } },
  pro:    { name:'Pro', price:49, tagline:'For serious marketers', popular:true,
    perks:['Everything in Starter','AI scoring & virality prediction','Trend discovery','Campaign Builder','5 brands'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:false, clients:false, seats:1, brands:5 } },
  studio: { name:'Studio', price:99, tagline:'For agencies',
    perks:['Everything in Pro','Competitor intelligence','Client portal','3 team seats','Unlimited brands'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:3, brands:999 } },
  agency: { name:'Agency', price:249, tagline:'For growing agencies',
    perks:['Everything in Studio','10 team seats','White-label exports','Priority generation','Approval workflows'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:10, brands:999 } },
  enterprise:{ name:'Enterprise', price:-1, tagline:'For organizations',
    perks:['Everything in Agency','Unlimited seats','Custom AI training','API access','Dedicated AM','SLA'],
    features:{ contentTypes:'all', images:true, exports:true, trends:true, score:true, campaigns:true, competitors:true, clients:true, seats:999, brands:999 } },
};
export const can = (plan: PlanKey, f: string) => !!PLANS[plan]?.features?.[f];
export const canType = (plan: PlanKey, t: string) => {
  const ct = PLANS[plan]?.features?.contentTypes;
  return ct === 'all' || (Array.isArray(ct) && ct.includes(t));
};
