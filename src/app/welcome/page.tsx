'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/components/useProfile';
import Logo from '@/components/Logo';

const STEPS = ['You', 'Brand', 'Goal', 'Plan'];
const ROLES = ['Brand / founder', 'Agency', 'Creator', 'Marketing team'];
const GOALS = ['Post consistently', 'Run a campaign', 'Grow followers', 'Win more clients'];
const INDUSTRIES = ['Retail', 'Food & Beverage', 'Tech / SaaS', 'Real estate', 'Fashion', 'Other'];
const USE_CASES = ['Social media content', 'Ads & campaigns', 'Client work', 'Product marketing', 'Personal brand', 'Just exploring'];

export default function Welcome() {
  const router = useRouter();
  const { profile } = useProfile();
  const [i, setI] = useState(0);
  const [data, setData] = useState<any>({ role: '', company: '', industry: '', goal: '', usecase: '' });
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    if (profile?.id) await supabase.from('profiles').update({
      role_type: data.role, company: data.company, industry: data.industry,
      goal: data.goal, use_case: data.usecase, onboarded: true,
    }).eq('id', profile.id);
    router.push('/dashboard');
  };

  const Card = ({ children }: any) => <div className="glass p-7 w-full max-w-md">{children}</div>;
  const Opt = ({ list, k }: any) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {list.map((o: string) => (
        <button key={o} onClick={() => setData({ ...data, [k]: o })}
          className={`rounded-xl border-2 px-3 py-3 text-[13px] font-semibold transition ${data[k] === o ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-white/10'}`}>{o}</button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen grid place-items-center p-5" style={{ background: 'linear-gradient(160deg,#fff,#F5F3FF 45%,#F8FAFC)' }}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-[360px] h-[360px] rounded-full bg-secondary/15 blur-2xl" />
        <div className="absolute -bottom-36 -left-24 w-[380px] h-[380px] rounded-full bg-primary/15 blur-2xl" />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <Logo />
          <div className="flex gap-1.5">{STEPS.map((_, s) => <span key={s} className={`w-7 h-1.5 rounded-full ${s <= i ? 'bg-gradient-to-r from-secondary to-primary' : 'bg-slate-200 dark:bg-white/10'}`} />)}</div>
        </div>
        <Card>
          {i === 0 && <><div className="font-mono text-[10px] font-bold tracking-widest text-primary">WELCOME TO ZELVO</div>
            <h1 className="font-sora font-extrabold text-2xl mt-1">What best describes you?</h1>
            <Opt list={ROLES} k="role" /></>}
          {i === 1 && <><div className="font-mono text-[10px] font-bold tracking-widest text-primary">YOUR BRAND</div>
            <h1 className="font-sora font-extrabold text-2xl mt-1">Tell us about your brand</h1>
            <input value={data.company} onChange={e => setData({ ...data, company: e.target.value })} placeholder="Brand or company name" className="field mt-4" />
            <Opt list={INDUSTRIES} k="industry" /></>}
          {i === 2 && <><div className="font-mono text-[10px] font-bold tracking-widest text-primary">YOUR GOAL</div>
            <h1 className="font-sora font-extrabold text-2xl mt-1">What do you want first?</h1>
            <Opt list={GOALS} k="goal" />
            <div className="text-[12px] text-slate-500 mt-5 mb-1 font-semibold">What will you mainly use Zelvoo for?</div>
            <Opt list={USE_CASES} k="usecase" /></>}
          {i === 3 && <><div className="font-mono text-[10px] font-bold tracking-widest text-primary">YOU'RE ALL SET</div>
            <h1 className="font-sora font-extrabold text-2xl mt-1">Your 7-day trial is live 🎉</h1>
            <p className="text-slate-500 text-sm mt-2">Based on “{data.goal || 'your goal'}”, we'll drop you straight into the right module with a starter checklist.</p>
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 mt-4 text-[13px] space-y-1.5">
              <div>👤 {data.role || '—'}</div><div>🏢 {data.company || '—'} · {data.industry || '—'}</div><div>🎯 {data.goal || '—'}</div><div>🧩 {data.usecase || '—'}</div>
            </div></>}
          <div className="flex gap-2 mt-6">
            {i > 0 && <button onClick={() => setI(i - 1)} className="pill !py-3 flex-1">← Back</button>}
            {i < 3 ? <button onClick={() => setI(i + 1)} className="cta !py-3 flex-[2]">Continue →</button>
                   : <button onClick={finish} disabled={saving} className="cta !py-3 flex-[2]">{saving ? 'Setting up…' : 'Enter Zelvoo →'}</button>}
          </div>
        </Card>
      </div>
    </div>
  );
}
