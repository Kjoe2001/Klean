'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { readApiResponse } from '@/lib/http';
import { Icon } from '@/components/Icon';

const ROLES = ['approver', 'admin', 'editor', 'viewer'];

async function getAccessToken() {
  let { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  await supabase.auth.getUser();
  ({ data: { session } } = await supabase.auth.getSession());
  if (session?.access_token) return session.access_token;

  const refreshed = await supabase.auth.refreshSession();
  return refreshed.data.session?.access_token || null;
}

export default function Workspaces() {
  const [list, setList] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [invite, setInvite] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    setBusy(true);
    setErr('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/workspaces', { headers: { Authorization: `Bearer ${token}` } });
      const data = await readApiResponse(response);
      const approvalsResponse = await fetch('/api/approvals', { headers: { Authorization: `Bearer ${token}` } });
      const approvalsData = await readApiResponse(approvalsResponse);
      setList(data.workspaces || []);
      setInvitations(data.invitations || []);
      setApprovals((approvalsData.approvals || []).filter((row: any) => row.status === 'pending'));
    } catch (e: any) {
      setErr(e?.message || 'Could not load workspaces.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return;
    setBusy(true);
    setErr('');
    setNote('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      await readApiResponse(response);
      setName('');
      setNote('Workspace created. Invite your approvers next.');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not create workspace.');
    } finally {
      setBusy(false);
    }
  };

  const inviteMember = async (workspaceId: string) => {
    const value = invite[workspaceId] || {};
    if (!value.email) return;
    setBusy(true);
    setErr('');
    setNote('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/workspaces', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspaceId, email: value.email, role: value.role || 'approver' }),
      });
      await readApiResponse(response);
      setInvite((prev: any) => ({ ...prev, [workspaceId]: { email: '', role: 'approver' } }));
      setNote('Invite sent by email and added to the teammate notification feed. They can accept it from Workspaces.');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not invite teammate.');
    } finally {
      setBusy(false);
    }
  };

  const totalMembers = list.reduce((sum, ws) => sum + (ws.members?.length || 0), 0);
  const totalApprovers = list.reduce((sum, ws) => sum + (ws.members || []).filter((m: any) => ['owner', 'admin', 'approver'].includes(m.role)).length, 0);

  const removeMember = async (workspaceId: string, member: any) => {
    setBusy(true);
    setErr('');
    setNote('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/workspaces', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspaceId, targetUserId: member.user_id }),
      });
      await readApiResponse(response);
      setNote(`${member.name || 'Member'} removed from workspace.`);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not remove member.');
    } finally {
      setBusy(false);
    }
  };

  const respondToInvitation = async (invitationId: string, decision: 'accept' | 'decline') => {
    setBusy(true);
    setErr('');
    setNote('');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Please log in again.');
      const response = await fetch('/api/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invitationId, decision }),
      });
      await readApiResponse(response);
      setNote(decision === 'accept' ? 'Invitation accepted. Workspace added to your account.' : 'Invitation declined.');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Could not respond to invitation.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Workspaces" subtitle="Create shared teams, invite approvers by email, and keep sign-off flowing without friction.">
      {!!invitations.length && (
        <div className="glass-card-light glass-highlight p-5 rounded-3xl mb-5">
          <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-bangladesh-green">PENDING INVITES</div>
          <div className="space-y-3 mt-3">
            {invitations.map((invite: any) => (
              <div key={invite.id} className="rounded-2xl border border-bangladesh-green/15 bg-white p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div>
                  <div className="font-heading font-medium text-rich-black">{invite.workspaceName}</div>
                  <div className="text-sm text-stone mt-1">{invite.inviterName || invite.inviterEmail} invited you as {invite.role}.</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-sky-300 px-4 py-2 text-sm font-medium text-sky-600" disabled={busy} onClick={() => respondToInvitation(invite.id, 'decline')}>Decline</button>
                  <button className="rounded-full bg-caribbean-green px-4 py-2 text-sm font-medium text-rich-black" disabled={busy} onClick={() => respondToInvitation(invite.id, 'accept')}>Accept invite</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!approvals.length && (
        <div className="glass-card-light glass-highlight p-5 rounded-3xl mb-5">
          <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-bangladesh-green">PENDING APPROVAL REVIEWS</div>
          <div className="space-y-3 mt-3">
            {approvals.slice(0, 8).map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-bangladesh-green/15 bg-white p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div>
                  <div className="font-heading font-medium text-rich-black">{item.title}</div>
                  <div className="text-sm text-stone mt-1">{item.workspaceName} · by {item.requestedBy}</div>
                </div>
                <div className="flex gap-2">
                  <a className="rounded-full border border-bangladesh-green/30 px-4 py-2 text-sm font-medium text-bangladesh-green" href={`/approvals/pdf?id=${encodeURIComponent(String(item.id || ''))}`}>Open PDF</a>
                  {item.targetLink && <a className="rounded-full border border-sky-300 px-4 py-2 text-sm font-medium text-sky-600" href={item.targetLink}>Open source</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <div className="feature-card p-5">
          <div className="text-feature-muted text-[11px] font-medium">Workspaces</div>
          <div className="text-3xl font-heading font-semibold text-anti-flash-white mt-1">{list.length}</div>
        </div>
        <div className="glass-card-light glass-highlight p-5">
          <div className="text-stone text-[11px] font-medium">Total teammates</div>
          <div className="text-3xl font-heading font-semibold text-rich-black mt-1">{totalMembers}</div>
        </div>
        <div className="glass-card-light glass-highlight p-5">
          <div className="text-stone text-[11px] font-medium">Approval seats</div>
          <div className="text-3xl font-heading font-semibold text-rich-black mt-1">{totalApprovers}</div>
        </div>
      </div>

      <div className="glass-card-light glass-highlight p-5 mb-5 rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-bangladesh-green">SETUP</div>
            <h2 className="font-heading font-semibold text-xl text-rich-black mt-1">Create a workspace for your team, boss, or client approvers.</h2>
            <p className="text-sm text-stone mt-1">Invite by email, assign approval power, and route campaign sign-off into one shared place.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input className="field !w-72" placeholder="Workspace name — e.g. Zelvoo Leadership Team" value={name} onChange={e => setName(e.target.value)} />
            <button className="cta px-6 py-3 text-sm" disabled={busy} onClick={create}>+ Create workspace</button>
          </div>
        </div>
      </div>

      {err && <p className="text-sm text-rose-500 mb-4">{err}</p>}
      {note && <p className="text-sm text-bangladesh-green mb-4">{note}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map(ws => (
          <div key={ws.id} className="glass-card-light glass-highlight p-5 rounded-3xl">
            {/** Invited approvers/admins can manage members. */}
            {(() => {
              const canManageMembers = ['owner', 'admin'].includes(ws.currentUserRole);
              return (
                <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-heading font-semibold text-rich-black text-lg">{ws.name}</div>
                <div className="text-xs text-stone mt-1">{ws.members?.length || 1} teammate(s) · you are {ws.currentUserRole}</div>
              </div>
              <span className="rounded-full bg-bangladesh-green/10 text-bangladesh-green border border-bangladesh-green/20 px-3 py-1 text-[11px] font-medium">Approvals ready</span>
            </div>

            <div className="space-y-2 my-4">
              {(ws.members || []).map((m: any) => (
                <div key={m.user_id} className="flex items-center justify-between rounded-2xl border border-bangladesh-green/12 bg-white px-3 py-2.5 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-rich-black truncate">{m.name}</div>
                    <div className="text-stone truncate">{m.email || m.user_id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-bangladesh-green uppercase">{m.role}</span>
                    {canManageMembers && m.role !== 'owner' && (
                      <button className="text-[11px] text-rose-500 font-semibold" disabled={busy} onClick={() => removeMember(ws.id, m)}>Remove</button>
                    )}
                  </div>
                </div>))}
            </div>

            <div className="rounded-2xl border border-dashed border-bangladesh-green/20 bg-anti-flash-white p-3">
              <div className="text-[10px] font-bold tracking-widest text-stone mb-2">INVITE TEAMMATE OR BOSS</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input className="field !py-2 !text-xs flex-1" placeholder="Invite by email"
                  value={invite[ws.id]?.email || ''} onChange={e => setInvite({ ...invite, [ws.id]: { ...invite[ws.id], email: e.target.value } })} />
                <select className="field !w-32 !py-2 !text-xs" value={invite[ws.id]?.role || 'approver'}
                  onChange={e => setInvite({ ...invite, [ws.id]: { ...invite[ws.id], role: e.target.value } })}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
                <button className="pill !text-[11px]" disabled={busy} onClick={() => inviteMember(ws.id)}>Add</button>
              </div>
              <p className="text-[11px] text-stone mt-2">Use role `approver` for bosses and final sign-off reviewers.</p>
            </div>
                </>
              );
            })()}
          </div>))}

        {!busy && list.length === 0 && (
          <div className="glass-card-light glass-highlight p-10 text-center text-sm text-stone col-span-full rounded-3xl">
            No workspace yet. Create one to start inviting teammates and routing approvals.
          </div>
        )}
      </div>
    </AppShell>
  );
}
