'use client';
import { supabase } from '@/lib/supabase';

const LEGACY_UNLIMITED_EMAILS = new Set(['oannoreric@gmail.com']);
const UNLIMITED_BALANCE = 999999;

const hasLegacyUnlimited = (email?: string | null) => {
  const normalized = email?.trim().toLowerCase();
  return !!normalized && LEGACY_UNLIMITED_EMAILS.has(normalized);
};

async function getAuthContext() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const sessionEmail = session?.user?.email;

  if (sessionEmail) {
    return { token, email: sessionEmail };
  }

  // Some client mounts race session hydration. getUser helps recover email for allowlist checks.
  const { data: { user } } = await supabase.auth.getUser();
  return { token, email: user?.email ?? null };
}

/* Client helper to spend credits before an action.
   Returns { ok, balance } — if !ok, the caller should block & show upgrade. */
export async function spendCredits(action: string): Promise<{ ok: boolean; balance: number; needed?: number }> {
  const { token, email } = await getAuthContext();
  if (hasLegacyUnlimited(email)) {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits:changed'));
    return { ok: true, balance: UNLIMITED_BALANCE };
  }
  if (!token) return { ok: false, balance: 0 };
  try {
    const r = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action }),
    });
    const d = await r.json();
    if (d?.ok && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('credits:changed'));
    }
    return { ok: !!d.ok, balance: d.balance ?? 0, needed: d.needed };
  } catch {
    return { ok: false, balance: 0 };
  }
}

export async function getCredits(): Promise<{ plan: string; credits: number }> {
  const { token, email } = await getAuthContext();
  if (hasLegacyUnlimited(email)) {
    return { plan: 'enterprise', credits: UNLIMITED_BALANCE };
  }
  if (!token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (hasLegacyUnlimited(user?.email)) {
        return { plan: 'enterprise', credits: UNLIMITED_BALANCE };
      }
    } catch {}
  }
  if (!token) return { plan: 'trial', credits: 0 };
  try {
    const r = await fetch('/api/credits', { headers: { Authorization: `Bearer ${token}` } });
    return await r.json();
  } catch {
    return { plan: 'trial', credits: 0 };
  }
}
