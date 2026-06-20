'use client';
import { supabase } from '@/lib/supabase';

/* Client helper to spend credits before an action.
   Returns { ok, balance } — if !ok, the caller should block & show upgrade. */
export async function spendCredits(action: string): Promise<{ ok: boolean; balance: number; needed?: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { ok: false, balance: 0 };
  try {
    const r = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    });
    const d = await r.json();
    return { ok: !!d.ok, balance: d.balance ?? 0, needed: d.needed };
  } catch {
    return { ok: false, balance: 0 };
  }
}

export async function getCredits(): Promise<{ plan: string; credits: number }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { plan: 'trial', credits: 0 };
  try {
    const r = await fetch('/api/credits', { headers: { Authorization: `Bearer ${token}` } });
    return await r.json();
  } catch {
    return { plan: 'trial', credits: 0 };
  }
}
