'use client';
import { useState, useEffect, useRef } from 'react';

/* Robust AI image loader for Pollinations.
   - shows a loading shimmer while fetching
   - times out slow requests and retries with a fresh seed
   - shows a tap-to-retry fallback instead of silently failing
   - never blocks the page */
export default function SmartImage({
  prompt,
  w = 700,
  h = 700,
  seed: initialSeed,
  className = '',
  rounded = 'rounded-xl',
}: {
  prompt?: string;
  w?: number;
  h?: number;
  seed?: number;
  className?: string;
  rounded?: string;
}) {
  const [seed, setSeed] = useState(initialSeed ?? Math.floor(Math.random() * 9999));
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<any>(null);

  const url = prompt
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}`
    : '';

  useEffect(() => {
    if (!prompt) return;
    setStatus('loading');
    // Pollinations generates on-demand; give it up to 30s, then offer retry
    timer.current = setTimeout(() => setStatus(s => (s === 'loading' ? 'error' : s)), 30000);
    return () => clearTimeout(timer.current);
  }, [url, prompt]);

  const retry = () => {
    setSeed(Math.floor(Math.random() * 9999));
    setAttempt(a => a + 1);
    setStatus('loading');
  };

  if (!prompt) return null;

  return (
    <div className={`relative overflow-hidden ${rounded} bg-slate-100 dark:bg-white/5 ${className}`}>
      {/* shimmer while loading */}
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 -z-10" />
        </div>
      )}

      {/* error / retry */}
      {status === 'error' && (
        <button
          onClick={retry}
          className="absolute inset-0 grid place-items-center text-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition"
        >
          <span className="text-[11px] text-slate-500">
            🖼 Image took too long
            <br />
            <span className="text-primary font-semibold">Tap to retry</span>
          </span>
        </button>
      )}

      {/* the image itself — key forces reload on retry */}
      <img
        key={attempt}
        src={url}
        alt=""
        loading="lazy"
        onLoad={() => {
          clearTimeout(timer.current);
          setStatus('ok');
        }}
        onError={() => {
          clearTimeout(timer.current);
          setStatus('error');
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
