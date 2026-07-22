let cache: any = null;

export const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; rate: number }> = {
  GH: { code: 'GHS', symbol: 'GH₵', rate: 15.5 },
  NG: { code: 'NGN', symbol: '₦',  rate: 1600 },
  KE: { code: 'KES', symbol: 'KSh', rate: 129 },
  ZA: { code: 'ZAR', symbol: 'R',  rate: 18.2 },
  GB: { code: 'GBP', symbol: '£',  rate: 0.79 },
  EU: { code: 'EUR', symbol: '€',  rate: 0.92 },
  US: { code: 'USD', symbol: '$',  rate: 1 },
};

const COUNTRY_ALIASES: Record<string, string> = {
  GHANA: 'GH',
  GHA: 'GH',
  NIGERIA: 'NG',
  NGA: 'NG',
  KENYA: 'KE',
  KEN: 'KE',
  SOUTHAFRICA: 'ZA',
  SOUTH_AFRICA: 'ZA',
  RSA: 'ZA',
  UK: 'GB',
  UNITEDKINGDOM: 'GB',
  GREATBRITAIN: 'GB',
  BRITAIN: 'GB',
  EUROPE: 'EU',
  EUROZONE: 'EU',
  USA: 'US',
  UNITEDSTATES: 'US',
};

function normalizeCountry(input?: string | null): string {
  if (!input) return 'US';

  const raw = String(input).trim();
  if (!raw) return 'US';

  // Supports values like "GH", "en-GH", "Ghana", "south africa".
  const localeRegion = raw.match(/(?:^|[-_])([A-Za-z]{2})$/)?.[1]?.toUpperCase();
  if (localeRegion && COUNTRY_CURRENCY[localeRegion]) return localeRegion;

  const upper = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (COUNTRY_CURRENCY[upper]) return upper;
  return COUNTRY_ALIASES[upper] || 'US';
}

function browserCountryHint(): string | null {
  if (typeof window === 'undefined') return null;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz === 'Africa/Accra') return 'GH';
  if (tz === 'Africa/Lagos') return 'NG';
  if (tz === 'Africa/Nairobi') return 'KE';
  if (tz === 'Africa/Johannesburg') return 'ZA';
  if (tz === 'Europe/London') return 'GB';

  const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const l of langs) {
    const code = normalizeCountry(l);
    if (code !== 'US') return code;
  }
  return null;
}

export function currencyForCountry(country?: string | null) {
  return COUNTRY_CURRENCY[normalizeCountry(country)] || COUNTRY_CURRENCY.US;
}

export async function localCurrency() {
  if (cache) return cache;
  try {
    const r = await fetch('/api/geo', { cache: 'no-store' });
    const geo = await r.json();
    const geoCode = normalizeCountry(geo?.country);
    const hintedCode = browserCountryHint();
    const finalCode = geoCode !== 'US' ? geoCode : hintedCode || geoCode;
    cache = { country: finalCode, ...COUNTRY_CURRENCY[finalCode] };
  } catch {
    const hintedCode = browserCountryHint() || 'US';
    cache = { country: hintedCode, ...COUNTRY_CURRENCY[hintedCode] };
  }
  return cache;
}

/* Returns e.g. "GH₵155 · $10" when local currency applies. Always keeps USD as the source of truth. */
export function formatLocal(usd: number, cur: any): string {
  if (!cur || cur.code === 'USD' || cur.rate === 1) return `$${usd}`;
  const local = Math.round(usd * cur.rate);
  return `${cur.symbol}${local.toLocaleString()}  ·  $${usd}`;
}
