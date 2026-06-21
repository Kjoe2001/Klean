'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';

const poll = (p: string, s: number) => `https://image.pollinations.ai/prompt/${encodeURIComponent(p + ', brand asset, high quality')}?width=400&height=400&nologo=true&seed=${s}`;
const FOLDERS = ['All assets', 'Logos', 'AI Images', 'Carousels', 'Exports', 'Client uploads'];
const SEED = [
  ['modern tech logo mark gradient', 'Logos'], ['product hero shot studio lighting', 'AI Images'],
  ['food photography pizza closeup', 'AI Images'], ['carousel slide bold typography', 'Carousels'],
  ['billboard mockup city night', 'AI Images'], ['minimalist brand pattern', 'Logos'],
  ['lifestyle flat lay desk', 'AI Images'], ['social post template orange', 'Carousels'],
];

export default function Assets() {
  const [folder, setFolder] = useState('All assets');
  const list = SEED.filter(([, f]) => folder === 'All assets' || f === folder);
  return (
    <AppShell>
      <PageHead kicker="ASSET MANAGER" title="Every visual in one place"
        sub="Logos, AI images, carousels and exports — searchable, foldered, reusable across all your brands and clients." />
      <div className="flex flex-wrap gap-2 mb-4">
        {FOLDERS.map(f => (
          <button key={f} onClick={() => setFolder(f)} className={`pill ${folder === f ? '!bg-gradient-to-r from-secondary to-primary !text-white !border-transparent' : ''}`}>{f}</button>
        ))}
        <button className="pill !border-dashed ml-auto">＋ Upload</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map(([p, f], i) => (
          <div key={i} className="glass !rounded-2xl overflow-hidden group">
            <img src={poll(p as string, i + 5)} alt="" className="w-full aspect-square object-cover" />
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 truncate">{f}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button className="text-[12px]">⬇</button><button className="text-[12px]">⋯</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
