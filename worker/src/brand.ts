/* Composites the brand mark onto a resolved media file with ffmpeg.
   Operates purely on a local file — it neither knows nor cares how that file
   was obtained. */

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { renderMark, type BrandSpec } from './badge.js';

export type { Aspect, Quality } from './geometry.js';
import { targetSize, overlayExpr, type Aspect, type Quality } from './geometry.js';
export { targetSize, overlayExpr };

export interface BrandOptions {
  inputPath: string;
  outputPath: string;
  workDir: string;
  spec: BrandSpec;
  aspect: Aspect;
  quality: Quality;
  srcWidth: number;
  srcHeight: number;
  signal: AbortSignal;
  onProgress?: (pct: number) => void;
  durationS?: number;
}

export async function brandVideo(opts: BrandOptions): Promise<void> {
  const { inputPath, outputPath, workDir, spec, aspect, quality, signal } = opts;

  if (quality === 'audio') {
    await runFfmpeg(
      ['-i', inputPath, '-vn', '-acodec', 'libmp3lame', '-b:a', '192k', '-y', outputPath],
      signal, opts.durationS, opts.onProgress,
    );
    return;
  }

  const size = targetSize(aspect, quality, opts.srcWidth, opts.srcHeight)!;
  const mark = await renderMark(spec, size.w, size.h, join(workDir, 'mark.png'));
  const pos = overlayExpr(spec, size.w, size.h, mark.width, mark.height);

  // Scale to cover the target box, centre-crop the overflow, then place the mark.
  const filter =
    `[0:v]scale=${size.w}:${size.h}:force_original_aspect_ratio=increase,` +
    `crop=${size.w}:${size.h},setsar=1[bg];` +
    `[bg][1:v]overlay=x='${pos.x}':y='${pos.y}':format=auto[out]`;

  await runFfmpeg([
    '-i', inputPath,
    '-i', mark.path,
    '-filter_complex', filter,
    '-map', '[out]',
    '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '128k',
    '-y', outputPath,
  ], signal, opts.durationS, opts.onProgress);
}

/** Probe a media file for dimensions and duration. */
export async function probe(path: string): Promise<{ width: number; height: number; duration: number }> {
  const out = await run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration',
    '-of', 'json', path,
  ]);
  const parsed = JSON.parse(out || '{}');
  const stream = parsed.streams?.[0] ?? {};
  return {
    width: Number(stream.width) || 0,
    height: Number(stream.height) || 0,
    duration: Number(parsed.format?.duration) || 0,
  };
}

function run(bin: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args);
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', reject);
    p.on('close', (code) => code === 0 ? resolve(out) : reject(new Error(`${bin} exited ${code}: ${err.slice(-500)}`)));
  });
}

function runFfmpeg(
  args: string[], signal: AbortSignal,
  durationS?: number, onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-progress', 'pipe:1', '-nostats', ...args]);
    let err = '';

    const onAbort = () => { p.kill('SIGKILL'); reject(new Error('cancelled')); };
    signal.addEventListener('abort', onAbort, { once: true });

    p.stdout.on('data', (d) => {
      if (!durationS || !onProgress) return;
      const m = /out_time_ms=(\d+)/.exec(String(d));
      if (m) {
        const pct = Math.min(99, Math.round((Number(m[1]) / 1e6 / durationS) * 100));
        onProgress(pct);
      }
    });
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', reject);
    p.on('close', (code) => {
      signal.removeEventListener('abort', onAbort);
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${err.slice(-500)}`));
    });
  });
}
