'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { PlanKey } from '@/lib/plans';

export type Profile = { id: string; email: string; name: string; plan: PlanKey; role: string;
  company?: string; industry?: string; country?: string; avatar_url?: string; trial_started_at?: string;
  onboarded?: boolean; activation?: Record<string, boolean>; role_type?: string; goal?: string; is_admin?: boolean };

export function useProfile(requireAuth = true) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (requireAuth) router.replace('/login'); setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile((data || { id: user.id, email: user.email, name: user.email?.split('@')[0], plan: 'trial', role: 'user' }) as Profile);
      setLoading(false);
    })();
  }, []);
  const trialDaysLeft = profile?.trial_started_at
    ? Math.max(0, Math.ceil(7 - (Date.now() - new Date(profile.trial_started_at).getTime()) / 86400000)) : 7;
  return { profile, setProfile, loading, trialDaysLeft, trialExpired: profile?.plan === 'trial' && trialDaysLeft <= 0 };
}
