'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import { getAuthCallbackUrl } from '@/lib/auth-redirect';

const ENABLE_GOOGLE_OAUTH = true;

function Form({ mode }: { mode: 'signup' | 'login' }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan');
  const callbackUrl = getAuthCallbackUrl(plan);

  const oauth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } });
    if (!error) return;

    if (error.message?.toLowerCase().includes('provider is not enabled')) {
      setErr('Google sign-in is not enabled yet. Use email/password for now.');
      return;
    }
    setErr(error.message || 'Could not start social sign-in. Please try again.');
  };

  const openOauthModal = () => {
    setErr('');
    setOauthModalOpen(true);
  };

  const confirmOauth = async () => {
    setOauthBusy(true);
    await oauth();
    setOauthBusy(false);
    setOauthModalOpen(false);
  };

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const normalizedEmail = form.email.trim().toLowerCase();

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: form.password,
          options: { data: { full_name: form.name }, emailRedirectTo: callbackUrl },
        });
        if (error) throw error;

        fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, name: form.name }),
        }).catch(() => {});

        if (!data.session) {
          setMsg('Check your inbox — we sent a confirmation link.');
          setBusy(false);
          return;
        }

        router.push(plan ? `/checkout?plan=${plan}` : '/welcome');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: form.password });
      if (error) throw error;
      router.push(plan ? `/checkout?plan=${plan}` : '/welcome');
    } catch (e: any) {
      setErr(e.message || 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen section-light grid place-items-center p-5 relative overflow-hidden">
      <div className="orb-fixed-light animate-orb" />
      <div className="w-full max-w-[460px] relative z-10">
        <div className="flex justify-center mb-8"><Logo darkText /></div>
        <div className="glass-elevated glass-highlight p-6 sm:p-8 md:p-9">
          <h1 className="font-heading font-semibold text-anti-flash-white text-[1.6rem] sm:text-2xl text-center mb-1 break-words">
            {mode === 'signup' ? 'Start your free trial' : 'Welcome back'}
          </h1>
          <p className="text-center text-sm text-pistachio mb-7">
            {mode === 'signup'
              ? 'Free 7-day trial · 50 credits · No card required'
              : 'Log in to your Zelvoo dashboard'}
          </p>

          <div className="flex flex-col gap-2.5 mb-6">
            {ENABLE_GOOGLE_OAUTH && (
              <button onClick={openOauthModal} className="btn-outline w-full flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="flex-1 h-px bg-mountain-meadow/25" />
            <span className="text-xs font-medium text-stone tracking-widest">OR</span>
            <span className="flex-1 h-px bg-mountain-meadow/25" />
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
          {msg && <p className="text-xs text-caribbean-green font-medium mt-3">{msg}</p>}

          <button onClick={submit} disabled={busy} className="btn-primary w-full mt-5">
            {busy
              ? <span className="w-4 h-4 rounded-full border-2 border-rich-black border-t-transparent animate-spin" />
              : (mode === 'signup' ? 'Create account' : 'Log in')}
          </button>

          <p className="text-center text-xs text-pistachio mt-5 flex items-center justify-center flex-wrap gap-x-1.5">
            {mode === 'signup'
              ? <>Already have an account? <Link className="inline-flex items-center min-h-11 text-caribbean-green font-medium hover:underline px-1" href={plan ? `/login?plan=${plan}` : '/login'}>Log in</Link></>
              : <><Link className="inline-flex items-center min-h-11 text-caribbean-green font-medium hover:underline px-1" href={plan ? `/forgot-password?plan=${plan}` : '/forgot-password'}>Forgot password?</Link><span aria-hidden="true">·</span><Link className="inline-flex items-center min-h-11 text-caribbean-green font-medium hover:underline px-1" href={plan ? `/signup?plan=${plan}` : '/signup'}>Start free trial</Link></>}
          </p>
        </div>
      </div>

      {oauthModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-rich-black/65 p-4">
          <div className="glass-elevated glass-highlight w-full max-w-md p-6">
            <h2 className="font-heading font-semibold text-anti-flash-white text-xl">Continue with Zelvoo Secure Auth</h2>
            <p className="text-sm text-pistachio mt-3 break-words">
              You are about to continue with Google sign-in.
              A trusted authentication page may briefly show our auth provider domain before returning to zelvoo.app.
            </p>
            <div className="mt-3 rounded-xl border border-caribbean-green/20 bg-rich-black/30 p-3">
              <p className="text-xs text-platinum leading-relaxed">
                Your password is never shared with Zelvoo during social sign-in. Authentication is encrypted and you will return to your Zelvoo account immediately after approval.
              </p>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setOauthModalOpen(false)}
                disabled={oauthBusy}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmOauth}
                disabled={oauthBusy}
                className="btn-primary flex-1"
              >
                {oauthBusy
                  ? <span className="w-4 h-4 rounded-full border-2 border-rich-black border-t-transparent animate-spin" />
                  : 'Continue with Google'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense><Form mode="signup" /></Suspense>;
}
