'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

const TABS = ['Overview', 'Generated Content', 'Brands', 'Credit Log'] as const;
type Tab = typeof TABS[number];

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleString() : '-';
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-bangladesh-green/8 text-[13px]">
      <span className="text-stone">{label}</span>
      <span className="font-medium text-rich-black text-right">{value ?? '-'}</span>
    </div>
  );
}

export default function UserDetailModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!userId) { setData(null); setTab('Overview'); return; }
    let active = true;
    setLoading(true);
    setErr('');
    (async () => {
      const token = await getAccessToken();
      if (!token) { if (active) { setErr('Unauthorized'); setLoading(false); } return; }
      try {
        const r = await fetch(`/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (!active) return;
        if (j.error) setErr(j.error);
        else setData(j.data);
      } catch (e: any) {
        if (active) setErr('Network error: ' + e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const p = data?.profile;

  return (
    <Modal open={!!userId} onClose={onClose} size="xl" title={p ? (p.name || p.email) : 'User details'}>
      {loading && <div className="text-sm text-stone py-10 text-center">Loading user…</div>}
      {err && <div className="text-sm text-danger py-10 text-center">{err}</div>}

      {data && (
        <div>
          <div className="flex flex-wrap gap-1.5 mb-4 border-b border-bangladesh-green/12 pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === t ? 'bg-caribbean-green text-rich-black' : 'bg-bangladesh-green/8 text-bangladesh-green hover:bg-bangladesh-green/15'
                }`}
              >
                {t}
                {t === 'Generated Content' && ` (${data.content.length})`}
                {t === 'Brands' && ` (${data.brands.length})`}
                {t === 'Credit Log' && ` (${data.credit_log.length})`}
              </button>
            ))}
          </div>

          {tab === 'Overview' && (
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="eyebrow mb-2">Account</p>
                <Row label="Email" value={p.email} />
                <Row label="Name" value={p.name} />
                <Row label="Company" value={p.company} />
                <Row label="Industry" value={p.industry} />
                <Row label="Country" value={p.country} />
                <Row label="Role" value={p.role} />
                <Row label="User ID" value={<span className="font-mono text-[10px]">{p.id}</span>} />
              </div>
              <div>
                <p className="eyebrow mb-2">Billing &amp; credits</p>
                <Row label="Plan" value={<Badge variant={p.plan === 'trial' ? 'muted' : 'primary'}>{p.plan}</Badge>} />
                <Row label="Credits balance" value={p.unlimited_credits ? 'Unlimited' : p.credits} />
                <Row label="Unlimited credits" value={p.unlimited_credits ? 'Yes' : 'No'} />
                <Row label="Trial started" value={fmt(p.trial_started_at)} />
                <Row label="Plan started" value={fmt(p.plan_started_at)} />
                <Row label="Credits period start" value={fmt(p.credits_period_start)} />
                <Row label="Joined" value={fmt(p.created_at)} />
              </div>
            </div>
          )}

          {tab === 'Generated Content' && (
            <div className="space-y-2">
              {data.content.length === 0 && <div className="text-sm text-stone text-center py-10">No content generated yet.</div>}
              {data.content.map((c: any) => (
                <div key={c.id} className="glass-card !bg-white/60 border border-bangladesh-green/10 rounded-[12px] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[13px]">{c.title || '(untitled)'}</span>
                    <Badge variant="teal">{c.type}</Badge>
                  </div>
                  <div className="text-[11px] text-stone mt-1">{fmt(c.created_at)}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Brands' && (
            <div className="space-y-2">
              {data.brands.length === 0 && <div className="text-sm text-stone text-center py-10">No brand kits created yet.</div>}
              {data.brands.map((b: any) => (
                <div key={b.id} className="glass-card !bg-white/60 border border-bangladesh-green/10 rounded-[12px] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[13px]">{b.name}</span>
                    {b.industry && <Badge variant="teal">{b.industry}</Badge>}
                  </div>
                  <div className="text-[11px] text-stone mt-1">{b.tone ? `${b.tone} · ` : ''}{fmt(b.created_at)}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Credit Log' && (
            <div className="space-y-1">
              {data.credit_log.length === 0 && <div className="text-sm text-stone text-center py-10">No credit activity logged.</div>}
              {data.credit_log.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-bangladesh-green/8 text-[13px]">
                  <span className={l.delta >= 0 ? 'text-caribbean-green font-medium' : 'text-danger font-medium'}>
                    {l.delta >= 0 ? '+' : ''}{l.delta}
                  </span>
                  <span className="text-stone flex-1 px-3 truncate">{l.reason}</span>
                  <span className="text-stone">bal {l.balance_after}</span>
                  <span className="text-[11px] text-stone ml-3">{fmt(l.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
