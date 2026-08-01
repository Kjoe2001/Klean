'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

type Step = { target?: string; title: string; desc: string };

const STEPS: Step[] = [
  {
    title: 'Welcome to Video Frame Studio',
    desc: 'This quick walkaround shows where to start and how to get your first framed video out fast.',
  },
  {
    target: 'frame-quick-card',
    title: 'Start here',
    desc: 'Click this card to open Video Frame Studio. Upload a clip, choose a template, and style your video.',
  },
  {
    target: 'frame-dashboard-header',
    title: 'Replay anytime',
    desc: 'Use this Video Frame walkthrough button whenever you want a refresher for yourself or a teammate.',
  },
  {
    title: 'You are ready',
    desc: 'Open Video Frame Studio now and create your first export in minutes.',
  },
];

export default function FrameTourOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: (markSeen: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const step = STEPS[i];
    if (!step.target) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector(`[data-frame-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
      else setRect(null);
    };

    const el = document.querySelector(`[data-frame-tour="${step.target}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const t = setTimeout(measure, 260);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, i]);

  if (!open) return null;

  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;
  const finish = () => onClose(true);
  const next = () => (isLast ? finish() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));

  const dots = (
    <div className="flex items-center gap-1.5">
      {STEPS.map((_, idx) => (
        <span
          key={idx}
          className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-4 bg-caribbean-green' : 'w-1.5 bg-anti-flash-white/30'}`}
        />
      ))}
    </div>
  );

  const card = (
    <div className="glass-elevated glass-highlight w-full max-w-[330px] p-5 pointer-events-auto">
      <h3 className="font-heading font-semibold text-anti-flash-white text-base">{step.title}</h3>
      <p className="text-sm text-pistachio mt-2 leading-relaxed">{step.desc}</p>
      <div className="flex items-center justify-between mt-5">
        {dots}
        <div className="flex items-center gap-2">
          {!isLast && (
            <button onClick={finish} className="text-xs text-stone hover:text-anti-flash-white transition-colors px-2 py-1.5">
              Skip
            </button>
          )}
          {i > 0 && !isLast && (
            <Button variant="outline" size="sm" onClick={back}>
              Back
            </Button>
          )}
          {isLast ? (
            <Link href="/frame-studio" onClick={finish}>
              <Button size="sm">Open Video Frame Studio</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={next}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[110] grid place-items-center bg-rich-black/65 p-4 pointer-events-auto">
        {card}
      </div>
    );
  }

  const pad = 8;
  const top = Math.max(16, Math.min(rect.top - pad + rect.height / 2 - 90, window.innerHeight - 260));
  const left = rect.right + 20;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-auto">
      <div
        className="absolute rounded-[16px] border-2 border-caribbean-green"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 9999px rgba(2,27,26,0.65), 0 0 24px rgba(0,223,129,0.35)',
        }}
      />
      <div className="absolute" style={{ top, left }}>
        {card}
      </div>
    </div>
  );
}