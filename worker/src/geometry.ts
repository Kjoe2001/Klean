/* Pure layout maths for the brand mark — no image or ffmpeg dependency, so it
   can be unit-tested on its own. */

export type Aspect = '9:16' | '1:1' | '4:5' | '16:9' | 'source';
export type Quality = '1080p' | '720p' | '480p' | 'audio';

export interface MarkPlacement {
  position: 'tl' | 'tr' | 'bl' | 'br' | 'bc';
  drift: boolean;
  safeInset: boolean;
}

const LONG_EDGE: Record<Exclude<Quality, 'audio'>, number> = {
  '1080p': 1080, '720p': 720, '480p': 480,
};
const RATIO: Record<Exclude<Aspect, 'source'>, number> = {
  '9:16': 9 / 16, '1:1': 1, '4:5': 4 / 5, '16:9': 16 / 9,
};

const even = (n: number) => (n % 2 === 0 ? n : n + 1);

/** Target pixel size for an aspect/quality pair. The quality label names the
 *  short edge on portrait targets, which is what a user means by "1080p". */
export function targetSize(aspect: Aspect, quality: Quality, srcW: number, srcH: number) {
  if (quality === 'audio') return null;
  const base = LONG_EDGE[quality];
  const ar = aspect === 'source' ? (srcW / srcH || 1) : RATIO[aspect];

  return ar >= 1
    ? { w: even(Math.round(base * ar)), h: even(base) }
    : { w: even(base), h: even(Math.round(base / ar)) };
}

/** ffmpeg overlay x/y expressions for a mark of mw x mh on a W x H frame. */
export function overlayExpr(spec: MarkPlacement, W: number, H: number, mw: number, mh: number) {
  const portrait = H > W;
  const m = Math.max(14, Math.round(Math.min(W, H) * (spec.safeInset && portrait ? 0.085 : 0.035)));
  const bottom = spec.safeInset && portrait ? Math.round(H * 0.20) : m;

  const anchors: Record<string, [number, number]> = {
    tl: [m, m],
    tr: [W - m - mw, m],
    bl: [m, H - bottom - mh],
    br: [W - m - mw, H - bottom - mh],
    bc: [Math.round((W - mw) / 2), H - bottom - mh],
  };

  if (!spec.drift) {
    const [x, y] = anchors[spec.position] ?? anchors.tr;
    return { x: String(x), y: String(y) };
  }

  // tl -> tr -> br -> bl on a 16s loop, smoothstep-eased between corners, so
  // the mark never sits still long enough to be cleanly cropped out.
  const order: Array<[number, number]> = [anchors.tl, anchors.tr, anchors.br, anchors.bl];
  const k = `mod(t/4\\,4)`;
  const i = `floor(${k})`;
  const f = `(${k}-${i})`;
  const u = `(${f}*${f}*(3-2*${f}))`;

  const pick = (axis: 0 | 1, idxExpr: string) =>
    order.reduce(
      (acc, pt, idx) => (idx === 0 ? String(pt[axis]) : `if(eq(${idxExpr}\\,${idx})\\,${pt[axis]}\\,${acc})`),
      String(order[0][axis]),
    );

  const from = (axis: 0 | 1) => pick(axis, i);
  const to = (axis: 0 | 1) => pick(axis, `mod(${i}+1\\,4)`);

  return {
    x: `(${from(0)})+((${to(0)})-(${from(0)}))*${u}`,
    y: `(${from(1)})+((${to(1)})-(${from(1)}))*${u}`,
  };
}
