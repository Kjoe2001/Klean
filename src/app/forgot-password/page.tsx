'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
export default function Forgot() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState('');
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-9 animate-rise text-center">
        <div className="flex justify-center mb-5"><Logo /></div>
        <h1 className="font-sora font-extrabold text-xl">Reset your password</h1>
        <p className="text-slate-500 text-xs mt-1 mb-6">We'll email you a secure reset link.</p>
        <input className="field mb-4" type="email" placeholder="Your account email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="cta w-full py-3.5 text-sm" onClick={async () => {
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
          setMsg(error ? error.message : '✓ Link sent — check your inbox.');
        }}>Send reset link</button>
        {msg && <p className="text-sm mt-3 font-semibold text-success">{msg}</p>}
      </div>
    </div>
  );
}
