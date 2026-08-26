/* Renders the brand mark to a transparent PNG for ffmpeg to overlay.
   Mirrors drawZelvooBadge() in public/video-frame-studio.js so the exported
   file matches what the studio previewed on canvas. */

import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

export type MarkStyle = 'badge' | 'wordmark' | 'icon';

export interface BrandSpec {
  style: MarkStyle;
  position: 'tl' | 'tr' | 'bl' | 'br' | 'bc';
  scale: number;      // % of min(width, height)
  opacity: number;    // 20-100
  drift: boolean;
  safeInset: boolean;
  logoUrl?: string | null;
  zelvoo: boolean;
}

const GREEN = '#00DF81';
const INK = '#eaf4ee';
const DEEP = '#032414';
const PLATE = 'rgba(4,22,13,0.72)';

/** Unbounded is not on the render host, so the wordmark is drawn as paths.
 *  Approximate advance widths at 1em for the six glyphs in "Zelvoo", measured
 *  from Unbounded 700 — enough to size the plate correctly. */
const ADVANCE = { Z: 0.66, e: 0.60, l: 0.30, v: 0.60, o: 0.64 };
const WORD_EM = ADVANCE.Z + ADVANCE.e + ADVANCE.l + ADVANCE.v + ADVANCE.o * 2;

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
}

/** Build the mark as an SVG at the pixel height the video needs. */
export function markSvg(spec: BrandSpec, markHeight: number): string {
  const h = Math.max(24, Math.round(markHeight));
  const icon = Math.round(h * 0.72);
  const pad = Math.round(h * 0.2);
  const fontSize = Math.round(h * 0.38);
  const textW = Math.round(WORD_EM * fontSize);

  const w =
    spec.style === 'badge' ? pad * 3 + icon + textW
    : spec.style === 'wordmark' ? pad * 2 + textW
    : pad * 2 + icon;

  const radius = Math.round(h * 0.35);
  const iconR = Math.round(icon * 0.28);
  const iconY = Math.round((h - icon) / 2);

  const parts: string[] = [];
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="${PLATE}"/>`);

  if (spec.style !== 'wordmark') {
    parts.push(
      `<rect x="${pad}" y="${iconY}" width="${icon}" height="${icon}" rx="${iconR}" fill="${GREEN}"/>`,
      `<text x="${pad + icon / 2}" y="${h / 2}" fill="${DEEP}" font-family="Arial,Helvetica,sans-serif"` +
      ` font-size="${Math.round(icon * 0.52)}" font-weight="800" text-anchor="middle"` +
      ` dominant-baseline="central">Z</text>`,
    );
  }
  if (spec.style !== 'icon') {
    const tx = spec.style === 'wordmark' ? pad : pad * 2 + icon;
    parts.push(
      `<text x="${tx}" y="${h / 2}" fill="${INK}" font-family="Arial,Helvetica,sans-serif"` +
      ` font-size="${fontSize}" font-weight="700" letter-spacing="${(fontSize * 0.01).toFixed(2)}"` +
      ` dominant-baseline="central">${escapeXml('Zelvoo')}</text>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('')}</svg>`;
}

/** Produce the overlay PNG. Returns its path and pixel size. */
export async function renderMark(
  spec: BrandSpec,
  videoW: number,
  videoH: number,
  outPath: string,
): Promise<{ path: string; width: number; height: number }> {
  const markHeight = Math.max(24, Math.round(Math.min(videoW, videoH) * (spec.scale / 100)));
  const alpha = Math.min(1, Math.max(0.2, spec.opacity / 100));

  let img: sharp.Sharp;

  if (!spec.zelvoo && spec.logoUrl) {
    // Paid plan with a custom mark: fit the user's logo to the same height.
    const src = spec.logoUrl.startsWith('http')
      ? Buffer.from(await (await fetch(spec.logoUrl)).arrayBuffer())
      : await readFile(spec.logoUrl);
    img = sharp(src).resize({ height: markHeight, withoutEnlargement: false });
  } else {
    img = sharp(Buffer.from(markSvg(spec, markHeight)));
  }

  // Bake opacity into the alpha channel so ffmpeg only has to place it.
  const buf = await img
    .ensureAlpha()
    .composite([{
      input: Buffer.from([255, 255, 255, Math.round(alpha * 255)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: 'dest-in',
    }])
    .png()
    .toBuffer();

  const meta = await sharp(buf).metadata();
  await sharp(buf).toFile(outPath);

  return { path: outPath, width: meta.width ?? markHeight, height: meta.height ?? markHeight };
}
