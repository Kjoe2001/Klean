import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { acceptFallbackWorkspaceInvitation, createFallbackWorkspace, createWorkspaceInvitation, declineWorkspaceInvitation, getWorkspaceInvitation, inviteFallbackMember, isMissingWorkspaceSchemaError, loadFallbackWorkspaceBundleForUser, loadFallbackWorkspacesForUser, removeFallbackMember, resolveWorkspaceInvitation } from '@/lib/workspace-store';

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

async function getMembershipMap(db: ReturnType<typeof admin>, userId: string) {
  const { data, error } = await db
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return new Map((data || []).map((row: any) => [row.workspace_id, row.role]));
}

async function loadWorkspacesForUser(db: ReturnType<typeof admin>, userId: string) {
  const membershipMap = await getMembershipMap(db, userId);
  const workspaceIds = [...membershipMap.keys()];
  if (!workspaceIds.length) return [];

  const { data: workspaces, error: wsError } = await db
    .from('workspaces')
    .select('id, name, owner_id, created_at')
    .in('id', workspaceIds)
    .order('created_at', { ascending: false });
  if (wsError) throw new Error(wsError.message);

  const { data: members, error: memberError } = await db
    .from('workspace_members')
    .select('workspace_id, user_id, role')
    .in('workspace_id', workspaceIds);
  if (memberError) throw new Error(memberError.message);

  const memberIds = [...new Set((members || []).map((m: any) => m.user_id))];
  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('id, name, email')
    .in('id', memberIds);
  if (profileError) throw new Error(profileError.message);

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
  const membersByWorkspace = new Map<string, any[]>();

  for (const member of members || []) {
    const profile = profileMap.get(member.user_id);
    const enriched = {
      user_id: member.user_id,
      role: member.role,
      name: profile?.name || 'Teammate',
      email: profile?.email || '',
    };
    const current = membersByWorkspace.get(member.workspace_id) || [];
    current.push(enriched);
    membersByWorkspace.set(member.workspace_id, current);
  }

  return (workspaces || []).map((ws: any) => ({
    ...ws,
    currentUserRole: membershipMap.get(ws.id) || 'viewer',
    members: (membersByWorkspace.get(ws.id) || []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

function mergeById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const merged = new Map<string, T>();
  for (const item of fallback) merged.set(item.id, item);
  for (const item of primary) merged.set(item.id, item);
  return [...merged.values()];
}

function inviteEmailHtml(inviterName: string, workspaceName: string, role: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7f6;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe7e3;">
      <div style="background:#022e28;padding:20px 24px;color:#00df81;font-weight:700;font-size:22px;">Workspace invitation</div>
      <div style="padding:24px;color:#14312b;line-height:1.6;font-size:14px;">
        <p style="margin:0 0 12px;">${inviterName} invited you to join <b>${workspaceName}</b> on Zelvoo.</p>
        <p style="margin:0 0 12px;">Your role: <b>${role}</b></p>
        <p style="margin:0 0 12px;">Open Zelvoo and go to Workspaces to accept or decline the invitation.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.zelvoo.app'}/workspaces" style="display:inline-block;background:#00df81;color:#022e28;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">Open Workspaces</a>
      </div>
    </div>
  </div>`;
}

async function sendInviteEmail(email: string, inviterName: string, workspaceName: string, role: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WELCOME_EMAIL_FROM || 'Zelvoo <no-reply@zelvoo.app>';
  if (!apiKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Invitation to join ${workspaceName} on Zelvoo`,
      html: inviteEmailHtml(inviterName, workspaceName, role),
    }),
  }).catch(() => {});
}

async function loadWorkspaceMetaFromTables(db: ReturnType<typeof admin>, workspaceId: string) {
  const { data, error } = await db.from('workspaces').select('id, name, owner_id, created_at').eq('id', workspaceId).single();
  if (error || !data) throw new Error(error?.message || 'Workspace not found.');
  return data;
}

async function createWorkspace(db: ReturnType<typeof admin>, userId: string, name: string) {
  const { data: workspace, error: createError } = await db
    .from('workspaces')
    .insert({ name, owner_id: userId })
    .select('id, name, owner_id, created_at')
    .single();
  if (createError) throw new Error(createError.message);

  const { error: memberError } = await db
    .from('workspace_members')
    .upsert({ workspace_id: workspace.id, user_id: userId, role: 'owner' });
  if (memberError) throw new Error(memberError.message);

  return workspace;
}

async function inviteMember(db: ReturnType<typeof admin>, user: any, workspaceId: string, email: string, role: string) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Invite email is required.');

  const membershipMap = await getMembershipMap(db, user.id);
  const actorRole = membershipMap.get(workspaceId);
  if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
    return NextResponse.json({ error: 'Only workspace owners or admins can invite teammates.' }, { status: 403 });
  }

  const { data: targetProfile, error: targetError } = await db
    .from('profiles')
    .select('id, name, email')
    .eq('email', normalizedEmail)
    .single();

  if (targetError || !targetProfile) {
    return NextResponse.json({
      error: 'That teammate has not signed up yet. Ask them to create an account first, then invite them again.',
      signupRequired: true,
    }, { status: 404 });
  }

  const safeRole = ['admin', 'editor', 'viewer', 'approver'].includes(role) ? role : 'editor';
  const { error: insertError } = await db
    .from('workspace_members')
    .upsert({ workspace_id: workspaceId, user_id: targetProfile.id, role: safeRole });
  if (insertError) throw new Error(insertError.message);

  try {
    await db.from('notifications').insert({
      user_id: targetProfile.id,
      title: 'Workspace invite',
      body: `${user.email || 'A teammate'} added you to a workspace as ${safeRole}.`,
      color: 'sky',
    });
  } catch {}

  return NextResponse.json({
    ok: true,
    member: {
      user_id: targetProfile.id,
      role: safeRole,
      name: targetProfile.name || 'Teammate',
      email: targetProfile.email || normalizedEmail,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    let workspaces: any[] = [];
    try {
      workspaces = await loadWorkspacesForUser(db, user.id);
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
    }
    const fallbackBundle = await loadFallbackWorkspaceBundleForUser(db, user.id);
    return NextResponse.json({
      workspaces: mergeById(workspaces, fallbackBundle.workspaces || []),
      invitations: fallbackBundle.invitations || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load workspaces' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { name } = await req.json();
    if (!String(name || '').trim()) {
      return NextResponse.json({ error: 'Workspace name is required.' }, { status: 400 });
    }

    let workspace;
    try {
      workspace = await createWorkspace(db, user.id, String(name).trim());
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      workspace = await createFallbackWorkspace(db, user, String(name).trim());
    }
    return NextResponse.json({ ok: true, workspace });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create workspace' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { workspaceId, email, role } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const { data: targetProfile, error: targetError } = await db
      .from('profiles')
      .select('id, name, email')
      .eq('email', normalizedEmail)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({
        error: 'That teammate has not signed up yet. Ask them to create an account first, then invite them again.',
        signupRequired: true,
      }, { status: 404 });
    }

    let workspaceMeta: any;
    try {
      const membershipMap = await getMembershipMap(db, user.id);
      const actorRole = membershipMap.get(String(workspaceId || ''));
      if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
        return NextResponse.json({ error: 'Only workspace owners or admins can invite teammates.' }, { status: 403 });
      }
      workspaceMeta = await loadWorkspaceMetaFromTables(db, String(workspaceId || ''));
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      const fallbackWorkspaces = await loadFallbackWorkspacesForUser(db, user.id);
      workspaceMeta = fallbackWorkspaces.find((ws: any) => ws.id === String(workspaceId || ''));
      if (!workspaceMeta) return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
      const actorRole = workspaceMeta.currentUserRole;
      if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
        return NextResponse.json({ error: 'Only workspace owners or admins can invite teammates.' }, { status: 403 });
      }
    }

    await createWorkspaceInvitation(db, user, targetProfile, { id: workspaceMeta.id, name: workspaceMeta.name }, String(role || 'editor'));
    await sendInviteEmail(targetProfile.email, user.email || 'A teammate', workspaceMeta.name, String(role || 'editor'));

    return NextResponse.json({ ok: true, invitationSent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to invite teammate' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { invitationId, decision } = await req.json();
    if (!String(invitationId || '').trim()) {
      return NextResponse.json({ error: 'Invitation is required.' }, { status: 400 });
    }
    if (!['accept', 'decline'].includes(String(decision || ''))) {
      return NextResponse.json({ error: 'Invalid invitation decision.' }, { status: 400 });
    }

    const invite = await getWorkspaceInvitation(db, user.id, String(invitationId));
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    if (decision === 'decline') {
      await declineWorkspaceInvitation(db, user.id, String(invitationId));
      return NextResponse.json({ ok: true });
    }

    try {
      const { error } = await db.from('workspace_members').upsert({ workspace_id: invite.workspaceId, user_id: user.id, role: invite.role });
      if (error) throw new Error(error.message);
      await resolveWorkspaceInvitation(db, user.id, String(invitationId), 'accepted');
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      await acceptFallbackWorkspaceInvitation(db, user, String(invitationId));
    }

    try {
      await db.from('notifications').insert({
        user_id: invite.inviterId,
        title: 'Invitation accepted',
        body: `${user.email || 'A teammate'} accepted your invite to ${invite.workspaceName}.`,
        color: 'emerald',
        link: '/workspaces',
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to respond to invitation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { workspaceId, targetUserId } = await req.json();
    if (!String(workspaceId || '').trim() || !String(targetUserId || '').trim()) {
      return NextResponse.json({ error: 'Workspace and target user are required.' }, { status: 400 });
    }

    try {
      const membershipMap = await getMembershipMap(db, user.id);
      const actorRole = membershipMap.get(String(workspaceId));
      if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
        return NextResponse.json({ error: 'You do not have permission to remove members.' }, { status: 403 });
      }

      const { data: targetMembership, error: targetMembershipError } = await db
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', String(workspaceId))
        .eq('user_id', String(targetUserId))
        .single();

      if (targetMembershipError || !targetMembership) {
        return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
      }
      if (targetMembership.role === 'owner') {
        return NextResponse.json({ error: 'Workspace owner cannot be removed.' }, { status: 400 });
      }

      const { error: deleteError } = await db
        .from('workspace_members')
        .delete()
        .eq('workspace_id', String(workspaceId))
        .eq('user_id', String(targetUserId));
      if (deleteError) throw new Error(deleteError.message);

      try {
        await db.from('notifications').insert({
          user_id: String(targetUserId),
          title: 'Workspace membership updated',
          body: 'You were removed from a workspace.',
          color: 'secondary',
        });
      } catch {}

      return NextResponse.json({ ok: true });
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
      await removeFallbackMember(db, user, String(workspaceId), String(targetUserId));
      return NextResponse.json({ ok: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to remove member' }, { status: 500 });
  }
}
