function normalizeBaseUrl(value?: string | null) {
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

export function getStandaloneContext(search?: string | URLSearchParams | null) {
  const params = typeof search === 'string'
    ? new URLSearchParams(search)
    : search instanceof URLSearchParams
      ? search
      : (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams());

  const standalone = params.get('standalone') === '1' || params.get('desktop') === '1';
  const flavor = params.get('desktopProduct') || params.get('flavor') || 'frame';
  return { standalone, flavor };
}

export function getStandaloneDefaultPath(search?: string | URLSearchParams | null): string {
  const context = getStandaloneContext(search);
  if (!context.standalone) return '/dashboard';

  const map: Record<string, string> = {
    frame: '/frame-studio',
    news: '/news-frame-studio',
    campaign: '/campaign-builder',
    content: '/content-studio',
    creative: '/creative-studio',
  };

  return map[context.flavor] || '/frame-studio';
}

export function getStandaloneProductName(search?: string | URLSearchParams | null): string {
  const context = getStandaloneContext(search);
  const map: Record<string, string> = {
    frame: 'Video Frame Studio',
    news: 'News Frame Studio',
    campaign: 'Campaign Builder',
    content: 'Content Studio',
    creative: 'Creative Studio',
  };
  return map[context.flavor] || 'Zelvoo';
}

export function withStandaloneParams(href: string, search?: string | URLSearchParams | null): string {
  const context = getStandaloneContext(search);
  if (!context.standalone) return href;

  const target = href.startsWith('http://') || href.startsWith('https://')
    ? new URL(href)
    : new URL(href, 'http://localhost');

  target.searchParams.set('standalone', '1');
  target.searchParams.set('desktopProduct', context.flavor);
  return `${target.pathname}${target.search}`;
}

export function getAuthCallbackUrl(plan?: string | null, next?: string | null): string {
  const appUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL?.trim());
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  let base = runtimeOrigin || appUrl || 'https://www.zelvoo.app';

  if (typeof window !== 'undefined' && window.location.hostname === 'zelvoo.app') {
    base = 'https://www.zelvoo.app';
  }

  if (
    typeof window !== 'undefined' &&
    appUrl?.includes('localhost') &&
    !window.location.hostname.includes('localhost')
  ) {
    base = runtimeOrigin;
  }

  if (typeof window !== 'undefined' && window.location.search.includes('standalone=1')) {
    const current = new URL(window.location.href);
    const nextValue = next || getStandaloneDefaultPath(current.search);
    const url = new URL('/auth/callback', base);
    if (plan) url.searchParams.set('plan', plan);
    url.searchParams.set('next', nextValue);
    return url.toString();
  }

  const url = new URL('/auth/callback', base);
  if (plan) url.searchParams.set('plan', plan);
  if (next) url.searchParams.set('next', next);
  return url.toString();
}