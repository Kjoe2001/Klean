'use client';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { COMMUNITY } from '@/lib/journey';

const tag: any = { Win: 'text-emerald bg-emerald/5 border-emerald/30', Discussion: 'text-primary bg-primary/5 border-primary/30', Announcement: 'text-secondary bg-secondary/5 border-secondary/30', Question: 'text-sky bg-sky/5 border-sky/30' };
export default function Community() {
  return (
    <AppShell>
      <PageHead kicker="COMMUNITY" title="Marketers building in public"
        sub="Swap wins, prompts and playbooks with thousands of African brands and creators using Zelvoo." />
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="cta !px-5 !py-2.5 !text-[13px]">＋ New post</button>
        {['Latest', 'Top', 'Wins', 'Questions'].map(f => <button key={f} className="pill">{f}</button>)}
      </div>
      <div className="space-y-3">
        {COMMUNITY.map(p => (
          <div key={p.id} className="glass p-4 flex gap-4 hover:-translate-y-0.5 transition">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/10 grid place-items-center text-xl shrink-0">{p.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[13px]">{p.author}</span>
                <span className="text-[11px] text-slate-400">{p.role}</span>
                <span className={`text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 ${tag[p.tag]}`}>{p.tag}</span>
              </div>
              <div className="font-sora font-bold text-[15px] mt-1">{p.title}</div>
              <div className="flex gap-4 mt-2 text-[12px] text-slate-400">
                <span>♥ {p.likes}</span><span>💬 {p.replies}</span><span>↗ Share</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
