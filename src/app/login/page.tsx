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
      router.push(plan ? `/checkout?plan=${plan}` : '/dashboard');
    } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB] grid place-items-center p-5">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-8">
          <h1 className="font-heading font-semibold text-[#0A0E27] text-2xl text-center mb-1">
            {mode === 'signup' ? 'Start your free trial' : 'Welcome back'}
          </h1>
          <p className="text-center text-sm text-[#6B7280] mb-7">
            {mode === 'signup' ? '7 days free · No credit card required' : 'Log in to your Zelvoo dashboard'}
          </p>

          {/* OAuth */}
          <div className="flex flex-col gap-2.5 mb-6">
            <button onClick={() => oauth('google')}
              className="btn-outline w-full flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button onClick={() => oauth('azure')}
              className="btn-outline w-full flex items-center justify-center gap-2">
              <span className="font-bold text-sky-600">⊞</span> Continue with Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs font-semibold text-[#9CA3AF] tracking-widest">OR</span>
            <span className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'signup' && (
              <input className="field" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            )}
            <input className="field" type="email" placeholder="Work email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="field" type="password" placeholder="Password (min 6 characters)" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>

          {err && <p className="text-xs text-danger font-medium mt-3">{err}</p>}
          {msg && <p className="text-xs text-teal font-semibold mt-3">{msg}</p>}

          <button onClick={submit} disabled={busy} className="btn-primary w-full mt-5">
            {busy
              ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>

          <p className="text-center text-xs text-[#6B7280] mt-5">
            {mode === 'signup'
              ? <>Already have an account? <Link className="text-primary font-semibold hover:underline" href="/login">Log in</Link></>
              : <><Link className="text-primary font-semibold hover:underline" href={plan ? `/forgot-password?plan=${plan}` : '/forgot-password'}>Forgot password?</Link> · <Link className="text-primary font-semibold hover:underline" href={plan ? `/signup?plan=${plan}` : '/signup'}>Start free trial</Link></>}
          </p>
        </div>
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><Form mode="login" /></Suspense>; }
