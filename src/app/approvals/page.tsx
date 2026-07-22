'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHead from '@/components/PageHead';
import { supabase } from '@/lib/supabase';
import { readApiResponse } from '@/lib/http';

const badge: any = { pending: 'text-secondary border-secondary/30 bg-secondary/5', approved: 'text-emerald border-emerald/30 bg-emerald/5', changes: 'text-sky border-sky/30 bg-sky/5' };
const LOCAL_ITEMS_KEY = 'zelvo:generated-items';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

function readLocalGeneratedItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ITEMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Approvals() {
  const [list, setList] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [targetType, setTargetType] = useState<'campaign-builder' | 'content-studio'>('campaign-builder');
  const [targetLink, setTargetLink] = useState('/campaign-builder');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const cols = [['pending', 'Awaiting review'], ['changes', 'Changes requested'], ['approved', 'Approved']];

  const load = async () => {
    setBusy(true);
    setErr('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/approvals', { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse(response);
      const localItems = readLocalGeneratedItems();
      setList(data.approvals || []);
      setWorkspaces(data.workspaces || []);
      setCampaigns([...(data.campaigns || []), ...(localItems.length && !(data.campaigns || []).length ? localItems.map((item: any) => ({
        id: item.id,
        name: item.title || 'Generated content',
        created_at: item.created_at,
        source: 'content-studio',
        link: '/content-studio',
      })) : [])]);
      if (!workspaceId && data.workspaces?.[0]?.id) setWorkspaceId(data.workspaces[0].id);
    } catch (e: any) {
      setErr(e?.message || 'Could not load approvals.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestApproval = async () => {
    if (!workspaceId || !campaignTitle.trim() || !selectedItemId) return;
    setBusy(true);
    setErr('');
    setNote('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspaceId, title: campaignTitle.trim(), message, targetType, targetLink, targetId: selectedItemId }),
      });
      await readApiResponse(response);
      setCampaignTitle('');
      setSelectedItemId('');
      setTargetType('campaign-builder');
      setTargetLink('/campaign-builder');
      setMessage('');
      setNote('Approval request sent to your workspace approvers.');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not create approval request.');
    } finally {
      setBusy(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setBusy(true);
    setErr('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      await readApiResponse(response);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not update approval status.');
    } finally {
      setBusy(false);
    }
  };

  const workspaceOptions = useMemo(() => workspaces.filter((ws: any) => ['owner', 'admin', 'editor'].includes(ws.role)), [workspaces]);
  const campaignOptions = useMemo(() => campaigns.filter((item: any) => item.source === 'campaign-builder'), [campaigns]);
  const contentStudioOptions = useMemo(() => campaigns.filter((item: any) => item.source === 'content-studio'), [campaigns]);
  const sourceOptions = useMemo(() => campaigns || [], [campaigns]);

  return (
    <AppShell>
      <PageHead kicker="APPROVALS" title="Review, request changes, sign off"
        sub="Send campaign drafts into a real workspace queue so bosses, approvers, and teammates can review before you move." />

      <div className="glass-card-light glass-highlight p-5 rounded-3xl mb-5">
        <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-stone mb-2">WORKSPACE</div>
            <select className="field" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
              <option value="">Choose workspace</option>
              {workspaceOptions.map((ws: any) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-stone mb-2">SELECT ITEM FROM SOURCE</div>
            <select
              className="field"
              value={selectedItemId}
              onChange={e => {
                const nextId = e.target.value;
                setSelectedItemId(nextId);
                const item = sourceOptions.find((x: any) => x.id === nextId);
                if (item) {
                  setCampaignTitle(item.name || 'Approval request');
                  setTargetType(item.source === 'content-studio' ? 'content-studio' : 'campaign-builder');
                  setTargetLink(item.link || (targetType === 'campaign-builder' ? '/campaign-builder' : '/content-studio'));
                }
              }}
            >
              <option value="">Choose an item</option>
              {sourceOptions.map((item: any) => (
                <option key={item.id} value={item.id}>{`${item.source === 'content-studio' ? 'Content Studio' : 'Campaign Builder'} - ${item.name}`}</option>
              ))}
            </select>
          </div>
          <button className="cta px-6 py-3 text-sm" disabled={busy || !workspaceId || !campaignTitle.trim() || !selectedItemId} onClick={requestApproval}>Request approval</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-stone mb-2">SOURCE</div>
            <select
              className="field"
              value={targetType}
              onChange={e => {
                const next = e.target.value as 'campaign-builder' | 'content-studio';
                setTargetType(next);
                setSelectedItemId('');
                setCampaignTitle('');
                setTargetLink(next === 'campaign-builder' ? '/campaign-builder' : '/content-studio');
              }}
            >
              <option value="campaign-builder">Campaign Builder</option>
              <option value="content-studio">Content Studio</option>
            </select>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-stone mb-2">LINK FOR REVIEW</div>
            <input
              className="field"
              placeholder="Auto-filled from selected item"
              value={targetLink}
              onChange={e => setTargetLink(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-[10px] font-bold tracking-widest text-stone mb-2">REQUEST TITLE</div>
          <input className="field" value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} placeholder="Title for approvers" />
        </div>
        <textarea className="field mt-3" rows={3} placeholder="Optional note for approvers — what should they look for?" value={message} onChange={e => setMessage(e.target.value)} />
      </div>

      {err && <p className="text-sm text-rose-500 mb-4">{err}</p>}
      {note && <p className="text-sm text-bangladesh-green mb-4">{note}</p>}

      <div className="grid md:grid-cols-3 gap-4">
        {cols.map(([key, label]) => (
          <div key={key} className="glass-card-light glass-highlight p-4 rounded-3xl">
            <div className="font-sora font-bold text-sm mb-3 flex items-center justify-between">
              {label}<span className="text-slate-400 font-normal">{list.filter(x => x.status === key).length}</span>
            </div>
            <div className="space-y-3">
              {list.filter(x => x.status === key).map(x => (
                <div key={x.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase border rounded-full px-2 py-0.5 ${badge[x.status]}`}>{x.workspaceName}</span>
                    <span className="text-[11px] text-slate-400">{x.score ? `★ ${x.score}` : x.requestedBy}</span>
                  </div>
                  <div className="font-semibold text-[13px] text-rich-black">{x.title}</div>
                  <div className="text-[11px] text-slate-500 mb-2">by {x.requestedBy}</div>
                  {!!x.targetType && <div className="text-[11px] text-slate-500 mb-2">Source: {x.targetType === 'campaign-builder' ? 'Campaign Builder' : 'Content Studio'}</div>}
                  {!!x.targetLink && (
                    <a href={x.targetLink} className="inline-flex text-[11px] text-sky-700 underline mb-2" target={x.targetLink.startsWith('http') ? '_blank' : undefined} rel={x.targetLink.startsWith('http') ? 'noreferrer noopener' : undefined}>
                      Open linked item
                    </a>
                  )}
                  <div className="mb-2">
                    <a href={`/approvals/pdf?id=${encodeURIComponent(String(x.id || ''))}`} className="inline-flex text-[11px] text-bangladesh-green underline">Open PDF review</a>
                  </div>
                  {!!x.message && <div className="text-[12px] text-stone mb-2">{x.message}</div>}
                  {!!x.reviewNote && <div className="text-[11px] text-sky-600 mb-2">Review note: {x.reviewNote}</div>}
                  {x.canReview && x.status !== 'approved' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => updateStatus(x.id, 'approved')} className="flex-1 text-[11.5px] font-bold text-emerald border border-emerald/30 rounded-lg py-1.5">Approve</button>
                      {x.status !== 'changes' && <button onClick={() => updateStatus(x.id, 'changes')} className="flex-1 text-[11.5px] font-bold text-sky border border-sky/30 rounded-lg py-1.5">Changes</button>}
                    </div>
                  )}
                </div>
              ))}
              {!busy && !list.filter(x => x.status === key).length && (
                <div className="rounded-xl border border-dashed border-bangladesh-green/20 p-4 text-sm text-stone text-center">No items in this column.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
