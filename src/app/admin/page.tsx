'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useProfile } from '@/components/useProfile';
import GlassCard from '@/components/GlassCard';
import Badge from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import UserDetailModal from './UserDetailModal';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-2xl font-heading font-semibold !text-caribbean-green">{value}</p>
      <p className="mt-1 text-[11px] text-anti-flash-white/70">{label}</p>
    </div>
  );
}

export default function Admin() {
  const { profile } = useProfile();
  const [s, setS] = useState<any>(null);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'credits' | 'content'>('created_at');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const load = async () => {
    const token = await getAccessToken();
    if (!token) { setErr('Unauthorized'); return; }
    try {
      const r = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (j.error) setErr(j.error);
      else { setErr(''); setS(j.data); }
    } catch (e: any) {
      setErr('Network error: ' + e.message);
    }
  };

  useEffect(() => {
    if (!profile) return;
    load();
    const intervalId = setInterval(load, 30000);
    return () => clearInterval(intervalId);
  }, [profile]);

  const customers = (s?.customers || []) as any[];

  const filtered = useMemo(() => {
    let rows = customers;
    if (planFilter !== 'all') rows = rows.filter((c) => (c.plan || 'trial') === planFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.country || '').toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      if (sortBy === 'credits') return (b.credits ?? 0) - (a.credits ?? 0);
      if (sortBy === 'content') return (b.usage?.content ?? 0) - (a.usage?.content ?? 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [customers, search, planFilter, sortBy]);

  if (!profile) return null;

  if (err) {
    return (
      <AppShell title="Admin">
        <div className="glass p-10 rounded-lg">
          <div className="text-sm font-semibold text-danger mb-2">Access denied: {err}</div>
          <div className="text-xs text-stone">This dashboard is restricted to the founder account.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin Panel" subtitle="Every registered user, what they've generated, and their credit balance.">
      {!s && (
        <GlassCard className="text-center py-16">
          <div className="sk h-8 w-8 rounded inline-block" />
          <div className="text-sm text-stone mt-4">Loading customer data...</div>
        </GlassCard>
      )}

      {s && (
        <>
          {/* Overview */}
          <div className="section-dark rounded-[24px] border border-mountain-meadow/15 p-5 md:p-6 mb-5">
            <p className="eyebrow mb-3 !text-caribbean-green">Overview</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatTile value={s.total_users ?? 0} label="Total users" />
              <StatTile value={s.trial_users ?? 0} label="Trial users" />
              <StatTile value={s.paid_users ?? 0} label="Paid users" />
              <StatTile value={s.signups_30d ?? 0} label="Signups (30d)" />
              <StatTile value={s.total_content ?? 0} label="Content generated" />
              <StatTile value={(s.total_credits_held ?? 0).toLocaleString()} label="Credits outstanding" />
            </div>
            {s.by_plan && Object.keys(s.by_plan).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(s.by_plan).map(([plan, count]) => (
                  <Badge key={plan} variant="teal" className="capitalize">{plan}: {count as number}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <GlassCard className="mb-4 !p-4">
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
              <Input
                placeholder="Search by name, email, company, country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                <option value="all">All plans</option>
                {Object.keys(PLANS).map((p) => (
                  <option key={p} value={p}>{PLANS[p as keyof typeof PLANS].name}</option>
                ))}
              </Select>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="created_at">Newest first</option>
                <option value="credits">Most credits</option>
                <option value="content">Most generated</option>
              </Select>
            </div>
          </GlassCard>

          {/* Customer Table */}
          <GlassCard className="!p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-bangladesh-green/15 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Users ({filtered.length}{filtered.length !== customers.length ? ` of ${customers.length}` : ''})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="text-left border-b border-bangladesh-green/15 bg-bangladesh-green/5">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Plan</th>
                    <th className="px-4 py-2">Credits</th>
                    <th className="px-4 py-2">Content generated</th>
                    <th className="px-4 py-2">Country</th>
                    <th className="px-4 py-2">Joined</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-stone">No users match.</td>
                    </tr>
                  ) : (
                    filtered.map((c: any) => (
                      <tr
                        key={c.id}
                        className="border-b border-bangladesh-green/10 hover:bg-bangladesh-green/5 cursor-pointer"
                        onClick={() => setSelectedUserId(c.id)}
                      >
                        <td className="px-4 py-2 font-medium">
                          {c.name || '-'}
                          {c.unlimited_credits && <Badge variant="teal" className="ml-2 !text-[9px] !py-0.5">UNLIMITED</Badge>}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-stone">{c.email}</td>
                        <td className="px-4 py-2 capitalize">
                          <Badge variant={c.plan === 'trial' ? 'muted' : 'primary'}>{c.plan || 'trial'}</Badge>
                        </td>
                        <td className="px-4 py-2">{c.unlimited_credits ? 'Unlimited' : (typeof c.credits === 'number' ? c.credits : '-')}</td>
                        <td className="px-4 py-2">{c.usage?.content ?? 0}</td>
                        <td className="px-4 py-2 text-[11px] text-stone">{c.country || '-'}</td>
                        <td className="px-4 py-2 text-[11px] text-stone">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-caribbean-green font-medium whitespace-nowrap">View →</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </AppShell>
  );
}
