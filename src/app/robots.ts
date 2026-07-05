import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/content-studio',
          '/image-studio',
          '/billing',
          '/security',
          '/welcome',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://www.zelvoo.app/sitemap.xml',
  };
}
