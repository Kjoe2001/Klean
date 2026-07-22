export function getAuthCallbackUrl(plan?: string | null): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  let base = runtimeOrigin || appUrl || 'https://www.zelvoo.app';

  // Canonicalize apex domain to www to match typical provider redirect allowlists.
  if (typeof window !== 'undefined' && window.location.hostname === 'zelvoo.app') {
    base = 'https://www.zelvoo.app';
  }

  // Ignore localhost app URL in live browsers to avoid invalid auth redirect URLs.
  if (
    typeof window !== 'undefined' &&
    appUrl?.includes('localhost') &&
    !window.location.hostname.includes('localhost')
  ) {
    base = runtimeOrigin;
  }

  const url = new URL('/auth/callback', base);
  if (plan) url.searchParams.set('plan', plan);
  return url.toString();
}