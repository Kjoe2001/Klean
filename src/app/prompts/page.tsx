'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

const SEED = [
  { id: 1, title: 'Punchy product launch hook', body: 'Write 5 launch hooks for {product} aimed at {audience}, each under 12 words, bold and benefit-led.', tag: 'Hooks', fav: true },
  { id: 2, title: 'Founder story carousel', body: 'Create a 7-slide carousel telling the origin story of {brand}, ending with a soft CTA.', tag: 'Carousel', fav: true },
  { id: 3, title: 'Weekly content plan', body: 'Plan 7 posts for {brand} this week across IG and LinkedIn, mixing education, social proof and promotion.', tag: 'Planning', fav: false },
  { id: 4, title: 'Reactive trend post', body: 'Turn the trend "{trend}" into an on-brand post for {brand} without being cringe.', tag: 'Trends', fav: false },
];

export default function Prompts() {
  const [list, setList] = useState(SEED);
  const [draft, setDraft] = useState({ title: '', body: '', tag: 'Custom' });
  const add = () => { if (!draft.title || !draft.body) return; setList([{ id: Date.now(), ...draft, fav: false }, ...list]); setDraft({ title: '', body: '', tag: 'Custom' }); };
  return (
    <AppShell>
      <PageHead kicker="SAVED PROMPTS" title="Your reusable prompt library"
        sub="Save the prompts that work, reuse them with variables, and keep your best plays one click away." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass p-5 lg:sticky lg:top-4 h-fit">
          <div className="font-sora font-bold mb-3">New prompt</div>
          <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="field mb-2" />
          <textarea value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} placeholder="Prompt body — use {variables}" rows={5} className="field mb-2" />
          <input value={draft.tag} onChange={e => setDraft({ ...draft, tag: e.target.value })} placeholder="Tag" className="field mb-3" />
          <button onClick={add} className="cta w-full !py-3">Save prompt</button>
        </div>
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {list.map(p => (
            <div key={p.id} className="glass p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="pill !py-1 !text-[10px]">{p.tag}</span>
                <button onClick={() => setList(list.map(x => x.id === p.id ? { ...x, fav: !x.fav } : x))} className="text-lg">{p.fav ? '⭐' : '☆'}</button>
              </div>
              <div className="font-sora font-bold text-[14px] mt-2">{p.title}</div>
              <div className="text-[12px] text-slate-500 mt-1 flex-1 font-mono leading-relaxed">{p.body}</div>
              <div className="flex gap-2 mt-3">
                <button className="cta !px-3 !py-2 !text-[12px] flex-1">Use in Studio →</button>
                <button onClick={() => navigator.clipboard?.writeText(p.body)} className="pill !py-2">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
