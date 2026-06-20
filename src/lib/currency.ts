'use client';
let cache: any = null;

export async function localCurrency() {
  if (cache) return cache;
  try {
    const r = await fetch('/api/geo');
    cache = await r.json();
  } catch {
    cache = { country: 'US', code: 'USD', symbol: '$', rate: 1 };
  }
  return cache;
}

/* Returns e.g. "$10" plus, if non-USD, "≈ GH₵155". Always keeps USD as the source of truth. */
export function formatLocal(usd: number, cur: any): string {
  if (!cur || cur.code === 'USD' || cur.rate === 1) return `$${usd}`;
  const local = Math.round(usd * cur.rate);
  return `$${usd}  ·  ≈ ${cur.symbol}${local.toLocaleString()}`;
}
