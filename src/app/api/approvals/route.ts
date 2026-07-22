import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createFallbackApproval, isMissingWorkspaceSchemaError, loadFallbackApprovalData, updateFallbackApprovalStatus } from '@/lib/workspace-store';

export const maxDuration = 30;

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function userFrom(req: NextRequest, db: ReturnType<typeof admin>) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const { data } = await db.auth.getUser(auth);
  return data?.user ?? null;
}

function encodeNote(payload: Record<string, any>) {
  return JSON.stringify(payload);
}

function decodeNote(note: string | null) {
  try {
    return note ? JSON.parse(note) : {};
  } catch {
    return { title: note || 'Approval request', message: '' };
  }
}

function sanitizeTargetLink(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === 'http:' || url.protocol === 'https:') return raw;
  } catch {}
  return '';
}

function appBaseUrl(req: NextRequest) {
  const raw = String(process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (raw) {
    try {
      const parsed = new URL(raw);
      if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.hostname.includes('.')) {
        return parsed.origin;
      }
    } catch {}
  }
  const host = req.headers.get('host');
  if (host) return `https://${host}`;
  return 'https://www.zelvoo.app';
}

function mergeById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const merged = new Map<string, T>();
  for (const item of fallback) merged.set(item.id, item);
  for (const item of primary) merged.set(item.id, item);
  return [...merged.values()];
}

function approvalEmailHtml(payload: { requester: string; workspaceName: string; title: string; sourceLabel: string; message: string; appUrl: string; approvalId: string }) {
  const pdfUrl = `${payload.appUrl}/approvals/pdf?id=${encodeURIComponent(payload.approvalId)}`;
  const workspaceUrl = `${payload.appUrl}/workspaces`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7f6;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dbe7e3;border-radius:14px;overflow:hidden;">
      <div style="background:#022e28;color:#00df81;padding:20px 24px;font-weight:700;font-size:22px;">Approval Requested</div>
      <div style="padding:22px 24px;color:#14312b;line-height:1.6;font-size:14px;">
        <p style="margin:0 0 10px;"><b>${payload.requester}</b> requested your review in <b>${payload.workspaceName}</b>.</p>
        <p style="margin:0 0 10px;"><b>Item:</b> ${payload.title}</p>
        <p style="margin:0 0 10px;"><b>Source:</b> ${payload.sourceLabel}</p>
        ${payload.message ? `<p style="margin:0 0 14px;"><b>Note:</b> ${payload.message}</p>` : ''}
        <a href="${pdfUrl}" style="display:inline-block;background:#00df81;color:#022e28;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:700;margin-right:8px;">Open PDF Review</a>
        <a href="${workspaceUrl}" style="display:inline-block;border:1px solid #00df81;color:#022e28;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700;">Open Workspaces</a>
      </div>
    </div>
  </div>`;
}

async function sendApprovalEmails(to: string[], payload: { requester: string; workspaceName: string; title: string; sourceLabel: string; message: string; appUrl: string; approvalId: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WELCOME_EMAIL_FROM || 'Zelvoo <no-reply@zelvoo.app>';
  if (!apiKey || !to.length) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Approval needed: ${payload.title}`,
      html: approvalEmailHtml(payload),
    }),
  }).catch(() => {});
}

async function loadMemberships(db: ReturnType<typeof admin>, userId: string) {
  const { data, error } = await db
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data || [];
}

async function loadApprovalData(db: ReturnType<typeof admin>, userId: string) {
  const memberships = await loadMemberships(db, userId);
  const workspaceIds = memberships.map((m: any) => m.workspace_id);
  const roleMap = new Map(memberships.map((m: any) => [m.workspace_id, m.role]));

  if (!workspaceIds.length) {
    return { approvals: [], workspaces: [], campaigns: [] };
  }

  const { data: workspaces, error: wsError } = await db
    .from('workspaces')
    .select('id, name')
    .in('id', workspaceIds)
    .order('created_at', { ascending: false });
  if (wsError) throw new Error(wsError.message);
  const workspaceMap = new Map((workspaces || []).map((ws: any) => [ws.id, ws]));

  const { data: approvals, error: approvalError } = await db
    .from('approvals')
    .select('id, workspace_id, requested_by, status, note, score, created_at, updated_at')
    .in('workspace_id', workspaceIds)
    .order('created_at', { ascending: false });
  if (approvalError) throw new Error(approvalError.message);

  const requesterIds = [...new Set((approvals || []).map((a: any) => a.requested_by).filter(Boolean))];
  const { data: requesters, error: requesterError } = await db
    .from('profiles')
    .select('id, name, email')
    .in('id', requesterIds.length ? requesterIds : ['00000000-0000-0000-0000-000000000000']);
  if (requesterError) throw new Error(requesterError.message);
  const requesterMap = new Map((requesters || []).map((p: any) => [p.id, p]));

  const { data: campaigns, error: campaignError } = await db
    .from('campaigns')
    .select('id, name, created_at, plan')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  const { data: contentRows } = await db
    .from('content')
    .select('id, title, created_at, type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);

  const { data: profileRow } = await db
    .from('profiles')
    .select('activation')
    .eq('id', userId)
    .single();

  const activationItems = Array.isArray(profileRow?.activation?.generated_items)
    ? profileRow.activation.generated_items
    : [];

  const requestableCampaigns = [
    ...((campaignError ? [] : (campaigns || [])).map((row: any) => ({
      id: row.id,
      name: row.name || 'Campaign draft',
      created_at: row.created_at,
      source: 'campaign-builder',
      link: `/campaign-builder?campaignId=${encodeURIComponent(String(row.id || ''))}`,
    }))),
    ...((contentRows || []).map((row: any) => ({
      id: row.id,
      name: row.title || (row.type === 'campaign' ? 'Campaign draft' : 'Content draft'),
      created_at: row.created_at,
      source: row.type === 'campaign' ? 'campaign-builder' : 'content-studio',
      link: row.type === 'campaign'
        ? `/campaign-builder?contentId=${encodeURIComponent(String(row.id || ''))}`
        : `/content-studio?contentId=${encodeURIComponent(String(row.id || ''))}`,
    }))),
    ...activationItems.map((row: any) => ({
      id: row.id,
      name: row.title || 'Generated content',
      created_at: row.created_at || new Date().toISOString(),
      source: 'content-studio',
      link: `/content-studio`,
    })),
  ].slice(0, 40);

  const normalizedApprovals = (approvals || []).map((row: any) => {
    const parsed = decodeNote(row.note);
    const workspace = workspaceMap.get(row.workspace_id);
    const requester = requesterMap.get(row.requested_by);
    const currentRole = roleMap.get(row.workspace_id) || 'viewer';
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      workspaceName: workspace?.name || 'Workspace',
      status: row.status,
      score: row.score,
      created_at: row.created_at,
      updated_at: row.updated_at,
      title: parsed.title || 'Approval request',
      message: parsed.message || '',
      targetId: parsed.targetId || '',
      targetType: parsed.targetType || '',
      targetLink: parsed.targetLink || '',
      reviewNote: parsed.reviewNote || '',
      requestedBy: requester?.name || requester?.email || 'Teammate',
      canReview: ['owner', 'admin', 'approver'].includes(currentRole),
    };
  });

  return {
    approvals: normalizedApprovals,
    workspaces: (workspaces || []).map((ws: any) => ({
      id: ws.id,
      name: ws.name,
      role: roleMap.get(ws.id) || 'viewer',
    })),
    campaigns: requestableCampaigns.map((row: any) => ({
      id: row.id,
      name: row.name || 'Campaign draft',
      created_at: row.created_at,
      source: row.source || 'campaign-builder',
      link: row.link || '/campaign-builder',
    })),
  };
}

async function loadSingleApproval(db: ReturnType<typeof admin>, userId: string, approvalId: string) {
  try {
    const data = await loadApprovalData(db, userId);
    const approval = (data.approvals || []).find((item: any) => item.id === approvalId);
    if (approval) return approval;
  } catch (e: any) {
    if (!isMissingWorkspaceSchemaError(e)) throw e;
  }
  const fallback = await loadFallbackApprovalData(db, userId);
  return (fallback.approvals || []).find((item: any) => item.id === approvalId) || null;
}

export async function GET(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const approvalId = String(new URL(req.url).searchParams.get('approvalId') || '').trim();
    if (approvalId) {
      const approval = await loadSingleApproval(db, user.id, approvalId);
      if (!approval) return NextResponse.json({ error: 'Approval request not found.' }, { status: 404 });
      return NextResponse.json({ approval });
    }
    const fallback = await loadFallbackApprovalData(db, user.id);
    try {
      const primary = await loadApprovalData(db, user.id);
      return NextResponse.json({
        approvals: mergeById(primary.approvals || [], fallback.approvals || []),
        workspaces: mergeById(primary.workspaces || [], fallback.workspaces || []),
        campaigns: primary.campaigns || [],
      });
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;

      const { data: profileRow } = await db
        .from('profiles')
        .select('activation')
        .eq('id', user.id)
        .single();
      const activationItems = Array.isArray(profileRow?.activation?.generated_items)
        ? profileRow.activation.generated_items
        : [];

      const { data: campaigns } = await db
        .from('content')
        .select('id, title, created_at, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(40);

      return NextResponse.json({
        ...fallback,
        campaigns: (campaigns || []).map((row: any) => ({
          id: row.id,
          name: row.title || (row.type === 'campaign' ? 'Campaign draft' : 'Content draft'),
          created_at: row.created_at,
          source: row.type === 'campaign' ? 'campaign-builder' : 'content-studio',
          link: row.type === 'campaign'
            ? `/campaign-builder?contentId=${encodeURIComponent(String(row.id || ''))}`
            : `/content-studio?contentId=${encodeURIComponent(String(row.id || ''))}`,
        })).concat(
          activationItems.map((row: any) => ({
            id: row.id,
            name: row.title || 'Generated content',
            created_at: row.created_at || new Date().toISOString(),
            source: 'content-studio',
            link: '/content-studio',
          })),
        ),
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load approvals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { workspaceId, title, message, score, targetType, targetLink, targetId } = await req.json();
    if (!String(workspaceId || '').trim() || !String(title || '').trim()) {
      return NextResponse.json({ error: 'Workspace and campaign title are required.' }, { status: 400 });
    }

    const safeTargetId = String(targetId || '').trim();
    const safeTargetType: '' | 'campaign-builder' | 'content-studio' =
      String(targetType || '') === 'campaign-builder' || String(targetType || '') === 'content-studio'
        ? (String(targetType) as 'campaign-builder' | 'content-studio')
        : '';
    const safeTargetLink = sanitizeTargetLink(targetLink);
    if (String(targetLink || '').trim() && !safeTargetLink) {
      return NextResponse.json({ error: 'Approval link must be a valid path or URL.' }, { status: 400 });
    }

    try {
      const memberships = await loadMemberships(db, user.id);
      if (!memberships.some((m: any) => m.workspace_id === workspaceId)) {
        return NextResponse.json({ error: 'You are not a member of that workspace.' }, { status: 403 });
      }

      const note = encodeNote({
        title: String(title).trim(),
        message: String(message || '').trim(),
        targetId: safeTargetId,
        targetType: safeTargetType,
        targetLink: safeTargetLink,
      });
      const { data: row, error } = await db
        .from('approvals')
        .insert({ workspace_id: workspaceId, requested_by: user.id, status: 'pending', note, score: Number(score || 0) || null })
        .select('id')
        .single();
      if (error) throw new Error(error.message);

      const { data: members } = await db
        .from('workspace_members')
        .select('user_id, role')
        .eq('workspace_id', workspaceId);

      const approvers = (members || [])
        .filter((m: any) => ['owner', 'admin', 'approver'].includes(m.role) && m.user_id !== user.id)
        .map((m: any) => m.user_id);

      const pdfLink = `/approvals/pdf?id=${encodeURIComponent(String(row.id || ''))}`;
      const approverIds = approvers.map((userId: string) => ({
        user_id: userId,
        title: 'Approval requested',
        body: `${user.email || 'A teammate'} requested approval for ${String(title).trim()}.`,
        color: 'secondary',
        link: pdfLink,
      }));

      if (approverIds.length) {
        try {
          await db.from('notifications').insert(approverIds);
        } catch {}
      }

      const { data: workspaceRow } = await db.from('workspaces').select('id, name').eq('id', workspaceId).single();
      const { data: approverProfiles } = await db
        .from('profiles')
        .select('id, email')
        .in('id', approvers.length ? approvers : ['00000000-0000-0000-0000-000000000000']);

      const approverEmails = (approverProfiles || []).map((p: any) => String(p.email || '').trim().toLowerCase()).filter(Boolean);
      await sendApprovalEmails(approverEmails, {
        requester: String(user.email || 'A teammate'),
        workspaceName: String(workspaceRow?.name || 'Workspace'),
        title: String(title).trim(),
        sourceLabel: safeTargetType === 'content-studio' ? 'Content Studio' : 'Campaign Builder',
        message: String(message || '').trim(),
        appUrl: appBaseUrl(req),
        approvalId: String(row.id || ''),
      });

      return NextResponse.json({ ok: true, id: row.id });
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      const row = await createFallbackApproval(
        db,
        user,
        String(workspaceId).trim(),
        String(title).trim(),
        String(message || '').trim(),
        Number(score || 0) || null,
        { targetId: safeTargetId, targetType: safeTargetType, targetLink: safeTargetLink },
      );
      return NextResponse.json({ ok: true, id: row.id });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create approval request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { id, status, reviewNote } = await req.json();
    const allowed = ['pending', 'approved', 'changes'];
    if (!allowed.includes(String(status || ''))) {
      return NextResponse.json({ error: 'Invalid approval status.' }, { status: 400 });
    }

    try {
      const { data: current, error: currentError } = await db
        .from('approvals')
        .select('id, workspace_id, note')
        .eq('id', id)
        .single();
      if (!currentError && current) {
        const memberships = await loadMemberships(db, user.id);
        const membership = memberships.find((m: any) => m.workspace_id === current.workspace_id);
        if (!membership || !['owner', 'admin', 'approver'].includes(membership.role)) {
          return NextResponse.json({ error: 'You do not have approval rights in this workspace.' }, { status: 403 });
        }

        const parsed = decodeNote(current.note);
        const nextNote = encodeNote({ ...parsed, reviewNote: String(reviewNote || '').trim() });
        const { error: updateError } = await db
          .from('approvals')
          .update({ status, note: nextNote, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (updateError) throw new Error(updateError.message);

        return NextResponse.json({ ok: true });
      }

      await updateFallbackApprovalStatus(db, user, String(id), status as any, String(reviewNote || '').trim());
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      await updateFallbackApprovalStatus(db, user, String(id), status as any, String(reviewNote || '').trim());
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update approval' }, { status: 500 });
  }
}
