/** Shared platform detection for the Video Download Studio.
 *  Used by /api/downloads to classify intake URLs and by the worker to pick a
 *  resolver. Detection only — nothing here fetches or extracts media. */

export type SourcePlatform =
  | 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'upload';

export const PLATFORM_LABEL: Record<SourcePlatform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  upload: 'Direct upload',
};

const HOST_MAP: Array<[RegExp, SourcePlatform]> = [
  [/(^|\.)tiktok\.com$/i,                'tiktok'],
  [/(^|\.)instagram\.com$/i,             'instagram'],
  [/(^|\.)(youtube\.com|youtu\.be)$/i,   'youtube'],
  [/(^|\.)(facebook\.com|fb\.watch)$/i,  'facebook'],
  [/(^|\.)linkedin\.com$/i,              'linkedin'],
];

export const MAX_BATCH = 20;

export type RejectReason = 'malformed' | 'unsupported_host' | 'not_https' | 'batch_limit';

/* Both variants carry both optional fields. The project compiles with
   strict:false, where discriminated-union narrowing on `ok` does not kick in,
   so callers must be able to read either field off the union directly. */
export type ParsedSource =
  | { ok: true;  url: string; platform: SourcePlatform; reason?: undefined }
  | { ok: false; url: string; platform?: undefined; reason: RejectReason };

/** Normalise and classify a single pasted URL. */
export function parseSource(raw: string): ParsedSource {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { ok: false, url: raw, reason: 'malformed' };

  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, url: trimmed, reason: 'malformed' };
  }

  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { ok: false, url: trimmed, reason: 'not_https' };
  }

  const hit = HOST_MAP.find(([re]) => re.test(u.hostname));
  if (!hit) return { ok: false, url: trimmed, reason: 'unsupported_host' };

  // Drop tracking params so the same post pasted twice dedupes cleanly.
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'igshid', 'fbclid', '_r', '_t']
    .forEach((k) => u.searchParams.delete(k));

  return { ok: true, url: u.toString(), platform: hit[1] };
}

/** Split a pasted textarea into at most MAX_BATCH classified entries. */
export function parseBatch(text: string) {
  const lines = (text || '')
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const accepted: Array<{ url: string; platform: SourcePlatform }> = [];
  const rejected: Array<{ url: string; reason: RejectReason }> = [];

  for (const line of lines) {
    const parsed = parseSource(line);
    if (!parsed.ok) {
      rejected.push({ url: parsed.url, reason: parsed.reason });
      continue;
    }
    if (seen.has(parsed.url)) continue;
    seen.add(parsed.url);
    if (accepted.length < MAX_BATCH) {
      accepted.push({ url: parsed.url, platform: parsed.platform });
    } else {
      rejected.push({ url: parsed.url, reason: 'batch_limit' });
    }
  }

  return { accepted, rejected, truncated: accepted.length >= MAX_BATCH };
}

export const QUALITIES = ['1080p', '720p', '480p', 'audio'] as const;
export const ASPECTS = ['9:16', '1:1', '4:5', '16:9', 'source'] as const;
export type Quality = (typeof QUALITIES)[number];
export type Aspect = (typeof ASPECTS)[number];

export type BrandSpec = {
  style: 'badge' | 'wordmark' | 'icon';
  position: 'tl' | 'tr' | 'bl' | 'br' | 'bc';
  scale: number;      // % of min(w,h)
  opacity: number;    // 0-100
  drift: boolean;
  safeInset: boolean;
  logoUrl?: string | null;   // paid plans: the user's own mark
  zelvoo: boolean;           // free/trial: force the Zelvoo badge
};

export const DEFAULT_BRAND: BrandSpec = {
  style: 'badge', position: 'tr', scale: 6.5, opacity: 92,
  drift: false, safeInset: true, logoUrl: null, zelvoo: true,
};

/** Clamp anything arriving from the client into a shape the worker can trust. */
export function sanitizeBrand(input: any, forceZelvoo: boolean): BrandSpec {
  const b = input && typeof input === 'object' ? input : {};
  const pick = <T extends string>(v: any, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v) ? v : fallback;

  return {
    style: pick(b.style, ['badge', 'wordmark', 'icon'] as const, DEFAULT_BRAND.style),
    position: pick(b.position, ['tl', 'tr', 'bl', 'br', 'bc'] as const, DEFAULT_BRAND.position),
    scale: Math.min(14, Math.max(3, Number(b.scale) || DEFAULT_BRAND.scale)),
    opacity: Math.min(100, Math.max(20, Number(b.opacity) || DEFAULT_BRAND.opacity)),
    drift: !!b.drift,
    safeInset: b.safeInset !== false,
    logoUrl: forceZelvoo ? null : (typeof b.logoUrl === 'string' ? b.logoUrl : null),
    zelvoo: forceZelvoo,
  };
}
