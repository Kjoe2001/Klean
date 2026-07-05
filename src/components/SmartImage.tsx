'use client';
import { useState, useEffect, useRef } from 'react';

/* AI image via server route (/api/image -> Replicate Flux).
   - posts the prompt, shows spinner, renders returned URL
   - tap-to-retry on failure, never blocks the page */
function buildFallbackImageUrl(prompt: string, w: number, h: number) {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams({ width: String(w), height: String(h), model: 'flux', nologo: 'true' });
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

export default function SmartImage({
  prompt,
  w = 1024,
  h = 1024,
  className = '',
  rounded = 'rounded-xl',
}: {
  prompt?: string;
  w?: number;
  h?: number;
  className?: string;
  rounded?: string;
}) {
  const [url, setUrl] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!prompt) return;
    setStatus('loading');
    setUrl('');
    (async () => {
      try {
        const fallbackUrl = buildFallbackImageUrl(prompt, w, h);
        const r = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, w, h }),
        });
        const d = await r.json();
        if (!alive.current) return;
        const resolvedUrl = d?.url || fallbackUrl;
        if (resolvedUrl) { setUrl(resolvedUrl); setStatus('loading'); }
        else setStatus('error');
      } catch {
        if (alive.current) {
          const fallbackUrl = buildFallbackImageUrl(prompt, w, h);
          setUrl(fallbackUrl);
          setStatus('loading');
        }
      }
    })();
    return () => { alive.current = false; };
  }, [prompt, w, h, attempt]);

  if (!prompt) return null;

  return (
    <div className={`relative overflow-hidden ${rounded} bg-slate-100 dark:bg-white/5 ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 -z-10" />
        </div>
      )}
      {status === 'error' && (
        <button onClick={() => setAttempt(a => a + 1)}
          className="absolute inset-0 grid place-items-center text-center p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition">
          <span className="text-[11px] text-slate-500">🖼 Couldn't generate<br /><span className="text-primary font-semibold">Tap to retry</span></span>
        </button>
      )}
      {url && (
        <img src={url} alt="" loading="lazy"
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
          className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`} />
      )}
    </div>
  );
}
