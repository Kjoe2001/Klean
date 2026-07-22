'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { readApiResponse } from '@/lib/http';

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

async function postIntelWithAuth(payload: any) {
  let token = await getAccessToken();
  if (!token) throw new Error('Please log in again to continue.');

  let response = await fetch('/api/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (response.status !== 401) return response;

  token = await getAccessToken();
  if (!token) return response;
  return fetch('/api/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export default function IntelTool({ tool, fields, table, renderReport, cta }: any) {
  const [input, setInput] = useState<any>({});
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);

  const reportColumn = useMemo(() => (table === 'campaigns' ? 'plan' : 'report'), [table]);

  const isMissingTableError = (error: any) => {
    const msg = String(error?.message || error || '');
    return /Could not find the table|schema cache|relation .* does not exist/i.test(msg);
  };

  const extractPayload = (row: any) => row?.plan || row?.report || row?.body || null;

  const storageKey = (uid?: string) => `zelvo:intel-history:${tool}:${uid || 'anon'}`;

  const readLocalHistory = (uid?: string): any[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(storageKey(uid));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeLocalHistory = (uid: string | undefined, rows: any[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey(uid), JSON.stringify(rows.slice(0, 40)));
    } catch {
      // Ignore local storage failures quietly.
    }
  };

  const makeLocalRow = (payloadReport: any, uid?: string) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    user_id: uid || null,
    name: input.brand || input.name || 'Saved request',
    scope: input.scope || null,
    goals: input.goals || null,
    audience: input.audience || null,
    industry: input.industry || null,
    [reportColumn]: payloadReport,
  });

  const requiredTextFields = fields.filter((f: any) => !f.options).map((f: any) => f.key);

  const historyTitle = (row: any) => {
    if (table === 'campaigns') {
      const payload = extractPayload(row) || {};
      const req = payload.__request || {};
      return req.brand || row.name || 'Campaign request';
    }
    if (table === 'competitors') return row.name || 'Competitor request';
    if (table === 'trends') return row.scope || 'Trend request';
    return 'Saved request';
  };

  const historySub = (row: any) => {
    if (table === 'campaigns') {
      const payload = extractPayload(row) || {};
      const req = payload.__request || {};
      return [req.objective, req.audience].filter(Boolean).join(' | ') || row.goals || 'Campaign strategy request';
    }
    if (table === 'competitors') return row.industry || 'Competitor analysis';
    if (table === 'trends') return row.industry || 'Trend discovery';
    return '';
  };

  const loadHistory = async () => {
    if (!table) return;
    setHistoryBusy(true);
    setErr('');
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { setHistory([]); return; }

      const { data, error } = await (supabase
        .from(table as any)
        .select(`id, created_at, ${reportColumn}, name, scope, goals, audience, industry`)
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(40) as any);
      if (error && table === 'campaigns' && isMissingTableError(error)) {
        const { data: contentData, error: contentErr } = await (supabase
          .from('content' as any)
          .select('id, created_at, title, body, type')
          .eq('user_id', uid)
          .eq('type', 'campaign')
          .order('created_at', { ascending: false })
          .limit(40) as any);
        if (contentErr && isMissingTableError(contentErr)) {
          setHistory(readLocalHistory(uid));
          return;
        }
        if (contentErr) throw new Error(contentErr.message);
        setHistory((contentData || []).map((r: any) => ({
          id: r.id,
          created_at: r.created_at,
          name: r.title,
          body: r.body,
        })));
        return;
      }
      if (error && isMissingTableError(error)) {
        setHistory(readLocalHistory(uid));
        return;
      }
      if (error) throw new Error(error.message);
      setHistory(data || []);
    } catch (e: any) {
      setErr(e.message || 'Could not load saved requests.');
    } finally {
      setHistoryBusy(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, reportColumn]);

  const validate = () => {
    for (const k of requiredTextFields) {
      const v = String(input[k] || '').trim();
      if (!v) throw new Error('Please fill all required fields before running analysis.');
    }
  };

  const persistReport = async (data: any) => {
    if (!table) return;

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) throw new Error('You must be logged in to save requests.');

    const payloadReport = { ...data, __request: input };

    const payload = table === 'campaigns'
      ? {
          user_id: uid,
          name: input.brand || input.name || 'Campaign',
          budget: parseFloat(String(input.budget || '').replace(/,/g, '')) || null,
          goals: input.goals,
          audience: input.audience,
          plan: payloadReport,
        }
      : table === 'competitors'
        ? { user_id: uid, name: input.name, industry: input.industry, report: payloadReport }
        : { user_id: uid, scope: input.scope, industry: input.industry, report: payloadReport };

    const { data: row, error } = await (supabase.from(table as any) as any).insert(payload as any).select('*').single();
    if (error && table === 'campaigns' && isMissingTableError(error)) {
      const { data: contentRow, error: contentError } = await (supabase.from('content' as any) as any)
        .insert({
          user_id: uid,
          type: 'campaign',
          title: input.brand || input.name || 'Campaign',
          body: payloadReport,
        })
        .select('id, created_at, title, body')
        .single();
      if (contentError && isMissingTableError(contentError)) {
        const localRow = makeLocalRow(payloadReport, uid);
        const updated = [localRow, ...readLocalHistory(uid)].slice(0, 40);
        writeLocalHistory(uid, updated);
        setHistory(updated);
        return;
      }
      if (contentError) throw new Error(`Saved result failed: ${contentError.message}`);
      setHistory((prev) => [
        {
          id: contentRow.id,
          created_at: contentRow.created_at,
          name: contentRow.title,
          body: contentRow.body,
        },
        ...prev,
      ].slice(0, 40));
      return;
    }
    if (error && isMissingTableError(error)) {
      const localRow = makeLocalRow(payloadReport, uid);
      const updated = [localRow, ...readLocalHistory(uid)].slice(0, 40);
      writeLocalHistory(uid, updated);
      setHistory(updated);
      return;
    }
    if (error) throw new Error(`Saved result failed: ${error.message}`);
    setHistory((prev) => [row, ...prev].slice(0, 40));
  };

  const run = async () => {
    if (busy) return; setBusy(true); setErr(''); setReport(null);
    try {
      validate();
      const r = await postIntelWithAuth({ tool, input });
      const j = await readApiResponse(r);
      if (j.error) throw new Error(j.error);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('credits:changed'));
      const payload = { ...j.data, __request: input };
      setReport(payload);
      await persistReport(j.data);
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  };

  const openSaved = (row: any) => {
    const payload = row?.[reportColumn] || extractPayload(row);
    if (!payload) return;
    setReport(payload);
    if (payload.__request && typeof payload.__request === 'object') {
      setInput((prev: any) => ({ ...prev, ...payload.__request }));
    }
    setErr('');
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
      <div className="glass-card-light glass-highlight p-6">
        {fields.map((f: any) => f.options ? (
          <div key={f.key} className="mb-3">
            <div className="text-[10px] font-bold tracking-widest text-stone mb-2">{f.label.toUpperCase()}</div>
            <div className="flex flex-wrap gap-2">{f.options.map((o: string) => (
              <button key={o} onClick={() => setInput({ ...input, [f.key]: o })}
                className={`pill !text-[12px] ${input[f.key] === o ? '!bg-caribbean-green !text-rich-black !border-transparent' : '!bg-white !text-bangladesh-green !border-bangladesh-green/20'}`}>{o}</button>))}</div>
          </div>
        ) : (
          <input key={f.key} className="field mb-3" placeholder={f.label} value={input[f.key] || ''}
            onChange={e => setInput({ ...input, [f.key]: e.target.value })} />
        ))}
        <button className="cta w-full py-3.5 text-sm mt-2" disabled={busy} onClick={run}>{busy ? '🧠 Analyzing…' : cta}</button>
        {err && <p className="text-rose-500 text-xs mt-3">{err}</p>}

        {table && (
          <div className="mt-4 border-t border-bangladesh-green/12 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold tracking-widest text-stone">SAVED REQUESTS</p>
              <button className="text-[11px] text-bangladesh-green font-medium" onClick={loadHistory}>Refresh</button>
            </div>
            {historyBusy ? (
              <div className="space-y-2">
                <div className="sk h-3 w-5/6" />
                <div className="sk h-3 w-4/6" />
                <div className="sk h-3 w-3/6" />
              </div>
            ) : !history.length ? (
              <p className="text-xs text-stone">Your requests will appear here after you run this tool.</p>
            ) : (
              <div className="max-h-64 overflow-auto space-y-2 pr-1">
                {history.map((row: any) => (
                  <button
                    key={row.id}
                    onClick={() => openSaved(row)}
                    className="w-full text-left bg-white rounded-xl border border-bangladesh-green/15 px-3 py-2 hover:border-bangladesh-green/30 transition"
                  >
                    <div className="text-[12px] font-semibold text-rich-black truncate">{historyTitle(row)}</div>
                    <div className="text-[11px] text-stone truncate mt-0.5">{historySub(row)}</div>
                    <div className="text-[10px] text-bangladesh-green mt-1">{new Date(row.created_at).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {busy && <div className="glass-card-light glass-highlight p-8 space-y-3"><div className="sk h-4 w-2/3" /><div className="sk h-3 w-5/6" /><div className="sk h-3 w-1/2" /><div className="sk h-3 w-3/4" /></div>}
        {!busy && !report && <div className="glass-card-light glass-highlight p-12 text-center text-sm text-stone">Results appear here.</div>}
        {report && <div className="animate-rise space-y-4">{renderReport(report, { input })}</div>}
      </div>
    </div>
  );
}

export function Block({ title, children }: any) {
  return <div className="glass-card-light glass-highlight p-5"><h3 className="font-sora font-bold text-sm mb-3 text-rich-black"><span className="text-bangladesh-green">/</span> {title}</h3><div className="text-rich-black">{children}</div></div>;
}
export const Bullets = ({ items }: any) => <ul className="space-y-1.5 text-[13.5px]">{(items||[]).map((x: any, i: number) =>
  <li key={i} className="flex gap-2"><span className="text-success font-bold">✓</span><span className="text-rich-black">{typeof x === 'string' ? x : JSON.stringify(x)}</span></li>)}</ul>;
