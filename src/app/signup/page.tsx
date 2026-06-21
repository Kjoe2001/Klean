'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';

function Form({ mode }: { mode: 'signup' | 'login' }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const router = useRouter(); const params = useSearchParams();
  const plan = params.get('plan');

  const oauth = (provider: 'google' | 'azure') =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}` } });

  const submit = async () => {
    setErr(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name }, emailRedirectTo: `${location.origin}/auth/callback` } });
        if (error) throw error;
        if (!data.session) { setMsg('Check your inbox — we sent a confirmation link.'); setBusy(false); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      }
      router.push(plan ? `/checkout?plan=${plan}` : '/welcome');
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-9 animate-rise">
        <div className="flex justify-center mb-5"><Logo /></div>
        <h1 className="font-sora font-extrabold text-xl text-center">{mode === 'signup' ? 'Start your free trial' : 'Welcome back'}</h1>
        <p className="text-center text-slate-500 text-xs mt-1 mb-6">{mode === 'signup' ? '7 days free · No credit card required' : 'Log in to your Zelvoo dashboard'}</p>
        <button onClick={() => oauth('google')} className="pill w-full !py-3 !text-[13.5px] flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-[15px]">G</span> Continue with Google
        </button>
        <button onClick={() => oauth('azure')} className="pill w-full !py-3 !text-[13.5px] flex items-center justify-center gap-2">
          <span className="font-bold text-[15px] text-sky-600">⊞</span> Continue with Microsoft
        </button>
        <div className="flex items-center gap-3 my-5 text-[10px] font-bold text-slate-400 tracking-widest">
          <span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />OR<span className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
        </div>
        {mode === 'signup' && <input className="field mb-3" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
        <input className="field mb-3" type="email" placeholder="Work email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="field" type="password" placeholder="Password (min 6 characters)" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && submit()} />
        {err && <p className="text-rose-500 text-xs mt-2">{err}</p>}
        {msg && <p className="text-success text-xs mt-2 font-semibold">{msg}</p>}
        <button onClick={submit} disabled={busy} className="cta w-full py-3.5 mt-5 text-[14px]">
          {busy ? '…' : mode === 'signup' ? 'Create account →' : 'Log in →'}
        </button>
        <div className="text-center text-xs text-slate-500 mt-4">
          {mode === 'signup'
            ? <>Already have an account? <Link className="text-primary font-bold" href={plan ? `/login?plan=${plan}` : '/login'}>Log in</Link></>
            : <><Link className="text-primary font-bold" href="/forgot-password">Forgot password?</Link> · <Link className="text-primary font-bold" href="/signup">Start free trial</Link></>}
        </div>
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Form mode="signup" /></Suspense>; }
