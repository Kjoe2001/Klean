/* Activation journey + growth data — single source of truth */

export type Step = { id: string; label: string; desc: string; href: string; icon: string };

export const ACTIVATION: Step[] = [
  { id: 'brand',    label: 'Set up your Brand Kit',     desc: 'Logo, colours, tone — auto-applied everywhere', href: '/brand-kit',     icon: '▣' },
  { id: 'generate', label: 'Generate your first content', desc: 'A full pack in under a minute',                href: '/content-studio', icon: '✦' },
  { id: 'schedule', label: 'Schedule your first post',    desc: 'Drop it on the calendar',                     href: '/calendar',      icon: '📅' },
  { id: 'campaign', label: 'Build a campaign',            desc: 'Strategy, budget and KPIs in one brief',      href: '/campaign-builder', icon: '◎' },
  { id: 'invite',   label: 'Invite a teammate',           desc: 'Collaborate in a shared workspace',           href: '/workspaces',    icon: '👥' },
  { id: 'upgrade',  label: 'Pick your plan',              desc: 'Unlock all 16 types + exports',               href: '/billing',       icon: '✨' },
];

export const TEMPLATES = [
  { id: 't1', title: '30-Day Content Calendar', cat: 'Calendar', uses: '12.4k', tier: 'free',    icon: '📅', desc: 'A month of posts mapped to your brand in one click.',
    focus: 'A 30-day content calendar with a themed post idea for every day of the month.', types: ['post', 'caption', 'hooks'] },
  { id: 't2', title: 'Product Launch Campaign', cat: 'Campaign', uses: '8.1k',  tier: 'starter', icon: '🚀', desc: 'Teaser → launch → social proof, fully sequenced.',
    focus: 'A product launch campaign sequenced as teaser, launch day, then social-proof follow-up.', types: ['hooks', 'post', 'email', 'adcopy'] },
  { id: 't3', title: 'Black Friday Blitz',       cat: 'Campaign', uses: '6.7k',  tier: 'pro',     icon: '🛍', desc: 'Countdown emails, ad copy and carousels.',
    focus: 'A Black Friday countdown campaign with urgency-driven offers across email, ads and carousels.', types: ['email', 'adcopy', 'carousel'] },
  { id: 't4', title: 'Founder Story Carousel',   cat: 'Social',   uses: '9.2k',  tier: 'free',    icon: '📖', desc: 'A 7-slide brand origin story that converts.',
    focus: 'A founder origin-story carousel that builds trust and ends on a clear call to action.', types: ['carousel', 'caption'] },
  { id: 't5', title: 'Webinar Funnel',           cat: 'Email',    uses: '4.3k',  tier: 'pro',     icon: '🎥', desc: 'Invite, reminder and replay email sequence.',
    focus: 'A webinar funnel email sequence: invite, reminder, and replay follow-up.', types: ['email', 'newsletter'] },
  { id: 't6', title: 'Restaurant Weekly Specials', cat: 'Social', uses: '5.5k', tier: 'starter', icon: '🍽', desc: 'Mouth-watering weekly social campaign copy.',
    focus: "This week's specials, written to drive foot traffic and online orders.", types: ['post', 'caption', 'reel'] },
  { id: 't7', title: 'Real-Estate Listing Pack', cat: 'Social',  uses: '3.9k',  tier: 'starter', icon: '🏠', desc: 'Listing captions, flyer and reel script.',
    focus: 'A new property listing marketed with captions, a flyer-ready description and a reel script.', types: ['post', 'caption', 'reel'] },
  { id: 't8', title: 'World Cup 2026 Engagement', cat: 'Campaign', uses: '7.8k', tier: 'pro',    icon: '⚽', desc: 'Match-day hooks and reactive content kit.',
    focus: 'Reactive World Cup 2026 match-day content: hooks, posts and ad variants tied to the tournament.', types: ['hooks', 'post', 'adcopy'] },
  { id: 't9', title: 'Free iPhone Duo Launch Kit', cat: 'Campaign', uses: '0', tier: 'free', icon: '📱', desc: 'Preorder announcement, price card, in-stock card and WhatsApp status.',
    focus: 'A 4-piece iPhone Duo launch kit: preorder announcement, price card, in-stock card and WhatsApp status. Your logo, your colours, your price — built in Zelvoo Creative Studio, so switching your Brand Kit re-skins all four in one click.', types: ['post', 'caption', 'product'] },
];

export const INTEGRATIONS = [
  { id: 'meta', name: 'Meta (FB + IG)', cat: 'Publishing', status: 'connect', icon: '📘', desc: 'Schedule and auto-publish to Facebook & Instagram.' },
  { id: 'linkedin', name: 'LinkedIn', cat: 'Publishing', status: 'connect', icon: '💼', desc: 'Publish company-page posts and articles.' },
  { id: 'tiktok', name: 'TikTok', cat: 'Publishing', status: 'connect', icon: '🎵', desc: 'Push reels and track performance.' },
  { id: 'x', name: 'X (Twitter)', cat: 'Publishing', status: 'connect', icon: '𝕏', desc: 'Thread scheduling and analytics.' },
  { id: 'ga', name: 'Google Analytics', cat: 'Analytics', status: 'connect', icon: '📊', desc: 'Pull traffic and conversion data.' },
  { id: 'gsc', name: 'Search Console', cat: 'Analytics', status: 'connect', icon: '🔍', desc: 'Keyword and ranking insights for SEO content.' },
  { id: 'mailchimp', name: 'Mailchimp', cat: 'Email', status: 'connect', icon: '🐵', desc: 'Sync email campaigns and audiences.' },
  { id: 'zapier', name: 'Zapier', cat: 'Automation', status: 'connect', icon: '⚡', desc: '6,000+ app automations via webhooks.' },
  { id: 'slack', name: 'Slack', cat: 'Collaboration', status: 'connect', icon: '💬', desc: 'Approval requests and publish alerts.' },
  { id: 'canva', name: 'Canva', cat: 'Design', status: 'connect', icon: '🎨', desc: 'Send visuals straight to a Canva project.' },
  { id: 'flw', name: 'Flutterwave', cat: 'Payments', status: 'connected', icon: '💳', desc: 'Billing & subscriptions — active.' },
  { id: 'supabase', name: 'Supabase', cat: 'Core', status: 'connected', icon: '🗄', desc: 'Auth, database & storage — active.' },
];

export const ACADEMY = [
  { id: 'l1', track: 'Getting Started', title: 'Your first 30 days of content', mins: 8, level: 'Beginner', icon: '🎬' },
  { id: 'l2', track: 'Getting Started', title: 'Building a Brand Kit that scales', mins: 6, level: 'Beginner', icon: '▣' },
  { id: 'l3', track: 'Content', title: 'Hooks that stop the scroll', mins: 11, level: 'Intermediate', icon: '🪝' },
  { id: 'l4', track: 'Content', title: 'Writing carousels that convert', mins: 9, level: 'Intermediate', icon: '🎠' },
  { id: 'l5', track: 'Growth', title: 'Reading your virality score', mins: 7, level: 'Intermediate', icon: '📈' },
  { id: 'l6', track: 'Agency', title: 'Onboarding clients in Zelvoo', mins: 12, level: 'Advanced', icon: '🤝' },
  { id: 'l7', track: 'Agency', title: 'White-label setup end to end', mins: 10, level: 'Advanced', icon: '🏷' },
  { id: 'l8', track: 'Growth', title: 'Turning trends into campaigns', mins: 9, level: 'Advanced', icon: '⚡' },
];

export const CASE_STUDIES = [
  { id: 'c1', brand: 'Melcom', sector: 'Retail', metric: '+212%', label: 'engagement on World Cup campaign', logo: '🛒', quote: 'Zelvoo turned a 3-week content sprint into an afternoon.' },
  { id: 'c2', brand: 'Pizza Hut Ghana', sector: 'QSR', metric: '4.1×', label: 'faster campaign turnaround', logo: '🍕', quote: 'Match-day reactive posts went out in minutes, not days.' },
  { id: 'c3', brand: 'Hallab', sector: 'F&B', metric: '+38%', label: 'order-link clicks from social', logo: '🥐', quote: 'The AI imagery alone replaced our photoshoot budget.' },
  { id: 'c4', brand: 'Aya Data', sector: 'B2B Tech', metric: '−61%', label: 'cost per qualified lead', logo: '📡', quote: 'LinkedIn articles that actually sound like our founders.' },
];

export const COMMUNITY = [
  { id: 'p1', author: 'Ama K.', role: 'Founder, Accra', avatar: '🧕', title: 'How I hit 10k followers using only Zelvoo carousels', replies: 34, likes: 218, tag: 'Win' },
  { id: 'p2', author: 'Kojo M.', role: 'Agency owner', avatar: '🧑🏾‍💼', title: 'Show your Brand Kit setups — drop screenshots', replies: 51, likes: 142, tag: 'Discussion' },
  { id: 'p3', author: 'Zelvoo Team', role: 'Official', avatar: '⚡', title: 'New: PowerPoint export now includes campaign-ready visuals', replies: 12, likes: 405, tag: 'Announcement' },
  { id: 'p4', author: 'Fatima S.', role: 'Creator', avatar: '👩🏽‍🎨', title: 'Best prompt patterns for high-performing carousels?', replies: 27, likes: 98, tag: 'Question' },
];

export const SUPPORT_FAQ = [
  { q: 'How does the 7-day trial work?', a: 'Full access to trial modules for 7 days, no card required. Pick a plan anytime to unlock all 16 content types and exports.' },
  { q: 'Which payment methods can my customers use?', a: 'Visa, Mastercard, MTN MoMo, Telecel Cash, AirtelTigo Money and bank transfer — all via Flutterwave.' },
  { q: 'Can I use Zelvoo for multiple brands?', a: 'Yes. Starter includes 1 Brand Kit; Pro 5; Studio and Agency are unlimited with client workspaces.' },
  { q: 'Do you offer white-label for agencies?', a: 'Agency plan includes a white-label client portal with your own logo, colours and domain.' },
  { q: 'How do refunds work?', a: 'See our refund policy — monthly plans can be cancelled anytime and you keep access until period end.' },
];

export const NOTIFICATIONS = [
  { id: 'n1', icon: '✅', title: 'Your Pro plan is active', body: 'Payment confirmed via MTN MoMo · receipt emailed', when: 'just now', unread: true, color: 'emerald' },
  { id: 'n2', icon: '✦', title: 'Carousel ready for review', body: 'Melcom World Cup pack scored 87 virality', when: '12m', unread: true, color: 'primary' },
  { id: 'n3', icon: '👤', title: 'Kojo joined your workspace', body: 'Accepted your invite as Editor', when: '1h', unread: true, color: 'sky' },
  { id: 'n4', icon: '📅', title: '3 posts publish tomorrow', body: 'Instagram & LinkedIn · 9:00 GMT', when: '3h', unread: false, color: 'secondary' },
  { id: 'n5', icon: '🎓', title: 'New Academy lesson', body: 'Turning trends into campaigns', when: '1d', unread: false, color: 'primary' },
];
