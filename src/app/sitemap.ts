import type { MetadataRoute } from 'next';

const BASE = 'https://www.zelvoo.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: '', frequency: 'weekly' as const, priority: 1 },
    { path: '/features', frequency: 'weekly' as const, priority: 0.95 },
    { path: '/pricing', frequency: 'weekly' as const, priority: 0.95 },
    { path: '/about', frequency: 'monthly' as const, priority: 0.7 },
    { path: '/contact', frequency: 'monthly' as const, priority: 0.6 },
    { path: '/academy', frequency: 'monthly' as const, priority: 0.65 },
    { path: '/case-studies', frequency: 'monthly' as const, priority: 0.65 },
    { path: '/templates', frequency: 'weekly' as const, priority: 0.8 },
    { path: '/trends', frequency: 'weekly' as const, priority: 0.8 },
    { path: '/competitors', frequency: 'weekly' as const, priority: 0.8 },
    { path: '/community', frequency: 'monthly' as const, priority: 0.6 },
    { path: '/partners', frequency: 'monthly' as const, priority: 0.6 },
    { path: '/affiliate', frequency: 'monthly' as const, priority: 0.6 },
    { path: '/white-label', frequency: 'monthly' as const, priority: 0.6 },
    { path: '/support', frequency: 'monthly' as const, priority: 0.55 },
    { path: '/security', frequency: 'monthly' as const, priority: 0.55 },
    { path: '/signup', frequency: 'monthly' as const, priority: 0.85 },
    { path: '/login', frequency: 'monthly' as const, priority: 0.4 },
    { path: '/privacy', frequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', frequency: 'yearly' as const, priority: 0.3 },
    { path: '/refund-policy', frequency: 'yearly' as const, priority: 0.3 },
    { path: '/cookies', frequency: 'yearly' as const, priority: 0.3 },
  ];

  return pages.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.frequency,
    priority: p.priority,
  }));
}
