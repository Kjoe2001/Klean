'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PLANS, type PlanKey } from '@/lib/plans';

export type Profile = { id: string; email: string; name: string; plan: PlanKey; role: string;
  company?: string; industry?: string; country?: string; avatar_url?: string; trial_started_at?: string;
  plan_started_at?: string; credits?: number;
  onboarded?: boolean; activation?: Record<string, boolean>; role_type?: string; goal?: string; use_case?: string; is_admin?: boolean };

export function useProfile(requireAuth = true) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (requireAuth) router.replace('/login'); setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile((data || { id: user.id, email: user.email, name: user.email?.split('@')[0], plan: 'trial', role: 'user' }) as Profile);
      setLiveCredits(data?.credits ?? null);
      setLoading(false);
    })();
  }, []);

  // Keep credits accurate after every generation — profile is only fetched
  // once on load, but credits change constantly. Re-sync from the
  // server-authoritative /api/credits whenever a spend happens elsewhere.
  useEffect(() => {
    const refresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      try {
        const r = await fetch('/api/credits', { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (typeof j.credits === 'number') setLiveCredits(j.credits);
      } catch {}
    };
    window.addEventListener('credits:changed', refresh);
    return () => window.removeEventListener('credits:changed', refresh);
  }, []);

  const credits = liveCredits ?? profile?.credits ?? 0;
  const plan = (profile?.plan || 'trial') as PlanKey;
  const planDays = PLANS[plan]?.days ?? 7;
  // a plan's clock starts at plan_started_at (paid plans) or trial_started_at (trial)
  const startStr = plan === 'trial' ? profile?.trial_started_at : (profile?.plan_started_at || profile?.trial_started_at);
  const start = startStr ? new Date(startStr).getTime() : null;

  const daysLeft = start != null
    ? Math.max(0, Math.ceil(planDays - (Date.now() - start) / 86400000))
    : planDays;

  const planExpired = start != null && (Date.now() - start) / 86400000 >= planDays;
  const outOfCredits = credits <= 0;

  // backward-compatible names
  const trialDaysLeft = daysLeft;
  const trialExpired = plan === 'trial' && planExpired;

  return {
    profile: profile ? { ...profile, credits } : profile, setProfile, loading,
    plan, daysLeft, planExpired, outOfCredits, credits,
    // access is locked when the paid/trial period has elapsed OR credits hit zero
    locked: planExpired || outOfCredits,
    trialDaysLeft, trialExpired,
  };
}
