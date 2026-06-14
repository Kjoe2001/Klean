'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
export default function Reset() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const router = useRouter();
  return (
    <div className="min-h-screen grid place-items-center p-5">
      <div className="glass w-full max-w-md p-9 animate-rise text-center">
        <h1 className="font-sora font-extrabold text-xl mb-5">Choose a new password</h1>
        <input className="field mb-4" type="password" placeholder="New password (min 6 chars)" value={pw} onChange={e => setPw(e.target.value)} />
        <button className="cta w-full py-3.5 text-sm" onClick={async () => {
          const { error } = await supabase.auth.updateUser({ password: pw });
          if (error) setErr(error.message); else router.push('/dashboard');
        }}>Update password →</button>
        {err && <p className="text-rose-500 text-xs mt-3">{err}</p>}
      </div>
    </div>
  );
}
