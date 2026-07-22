const STORE_KEY = 'workspace_state';
const MAX_WORKSPACES = 4;
const MAX_MEMBERS = 12;
const MAX_APPROVALS = 6;
const MAX_INVITATIONS = 20;
const MAX_NOTIFICATIONS = 20;

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'approver';

export type WorkspaceInvite = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  role: WorkspaceRole;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at?: string;
};

export type WorkspaceNotification = {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
  unread: boolean;
  link?: string;
  created_at: string;
  kind?: 'workspace-invite' | 'workspace-update';
  invitationId?: string;
};

type WorkspaceMember = {
  user_id: string;
  role: WorkspaceRole;
  name: string;
  email: string;
};

type WorkspaceApproval = {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  targetId?: string;
  targetType?: 'campaign-builder' | 'content-studio' | '';
  targetLink?: string;
  status: 'pending' | 'approved' | 'changes';
  score: number | null;
  requested_by: string;
  requestedBy: string;
  reviewNote?: string;
  created_at: string;
  updated_at: string;
};

type WorkspaceRecord = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  members: WorkspaceMember[];
  approvals: WorkspaceApproval[];
};

type WorkspaceStore = {
  workspaces: WorkspaceRecord[];
  invitations: WorkspaceInvite[];
  notifications: WorkspaceNotification[];
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeStore(raw: any): WorkspaceStore {
  const workspaces = Array.isArray(raw?.workspaces) ? raw.workspaces : [];
  const invitations = Array.isArray(raw?.invitations) ? raw.invitations : [];
  const notifications = Array.isArray(raw?.notifications) ? raw.notifications : [];
  return { workspaces, invitations, notifications };
}

function shortText(value: any, max = 120) {
  const text = String(value || '').trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function sanitizeWorkspaceStore(store: WorkspaceStore): WorkspaceStore {
  const workspaces = (Array.isArray(store?.workspaces) ? store.workspaces : [])
    .slice(0, MAX_WORKSPACES)
    .map((ws: any) => ({
      id: String(ws?.id || makeId()),
      name: shortText(ws?.name || 'Workspace', 120),
      owner_id: String(ws?.owner_id || ''),
      created_at: ws?.created_at || new Date().toISOString(),
      members: (Array.isArray(ws?.members) ? ws.members : []).slice(0, MAX_MEMBERS).map((m: any) => ({
        user_id: String(m?.user_id || ''),
        role: ['owner', 'admin', 'editor', 'viewer', 'approver'].includes(String(m?.role || '')) ? m.role : 'viewer',
        name: shortText(m?.name || 'Teammate', 80),
        email: shortText(m?.email || '', 120),
      })),
      approvals: (Array.isArray(ws?.approvals) ? ws.approvals : []).slice(0, MAX_APPROVALS).map((a: any) => ({
        id: String(a?.id || makeId()),
        workspaceId: String(a?.workspaceId || ws?.id || ''),
        title: shortText(a?.title || 'Approval request', 90),
        message: shortText(a?.message || '', 120),
        targetId: shortText(a?.targetId || '', 80),
        targetType: a?.targetType === 'campaign-builder' || a?.targetType === 'content-studio' ? a.targetType : '',
        targetLink: shortText(a?.targetLink || '', 120),
        status: ['pending', 'approved', 'changes'].includes(String(a?.status || '')) ? a.status : 'pending',
        score: Number.isFinite(Number(a?.score)) ? Number(a.score) : null,
        requested_by: String(a?.requested_by || ''),
        requestedBy: shortText(a?.requestedBy || 'Teammate', 60),
        reviewNote: shortText(a?.reviewNote || '', 80),
        created_at: a?.created_at || new Date().toISOString(),
        updated_at: a?.updated_at || new Date().toISOString(),
      })),
    }));

  const invitations = (Array.isArray(store?.invitations) ? store.invitations : [])
    .slice(0, MAX_INVITATIONS)
    .map((invite: any) => ({
      id: String(invite?.id || makeId()),
      workspaceId: String(invite?.workspaceId || ''),
      workspaceName: shortText(invite?.workspaceName || 'Workspace', 80),
      inviterId: String(invite?.inviterId || ''),
      inviterName: shortText(invite?.inviterName || 'Teammate', 50),
      inviterEmail: shortText(invite?.inviterEmail || '', 80),
      role: ['owner', 'admin', 'editor', 'viewer', 'approver'].includes(String(invite?.role || '')) ? invite.role : 'viewer',
      status: ['pending', 'accepted', 'declined'].includes(String(invite?.status || '')) ? invite.status : 'pending',
      created_at: invite?.created_at || new Date().toISOString(),
      responded_at: invite?.responded_at,
    }));

  const notifications = (Array.isArray(store?.notifications) ? store.notifications : [])
    .slice(0, MAX_NOTIFICATIONS)
    .map((item: any) => ({
      id: String(item?.id || makeId()),
      title: shortText(item?.title || 'Update', 60),
      body: shortText(item?.body || '', 100),
      icon: shortText(item?.icon || '🔔', 8),
      color: shortText(item?.color || 'secondary', 20),
      unread: item?.unread !== false,
      link: shortText(item?.link || '', 90),
      created_at: item?.created_at || new Date().toISOString(),
      kind: item?.kind === 'workspace-invite' || item?.kind === 'workspace-update' ? item.kind : undefined,
      invitationId: item?.invitationId ? String(item.invitationId) : undefined,
    }));

  return { workspaces, invitations, notifications };
}

function sanitizeUserMetadata(meta: any, opts?: { stripWorkspaceStore?: boolean }) {
  const safeMeta = (meta && typeof meta === 'object') ? { ...meta } : {};
  delete (safeMeta as any).generated_items;
  delete (safeMeta as any).uploaded_assets;

  if (opts?.stripWorkspaceStore) {
    delete (safeMeta as any)[STORE_KEY];
  } else if ((safeMeta as any)[STORE_KEY]) {
    (safeMeta as any)[STORE_KEY] = sanitizeWorkspaceStore(normalizeStore((safeMeta as any)[STORE_KEY]));
  }

  return safeMeta;
}

function storeHasData(store: WorkspaceStore) {
  return (store.workspaces?.length || 0) > 0 || (store.invitations?.length || 0) > 0 || (store.notifications?.length || 0) > 0;
}

async function loadProfileActivation(db: any, user: any) {
  const load = async () => db.from('profiles').select('activation').eq('id', user.id).single();
  let result = await load();
  if (result.error) {
    await db.from('profiles').upsert({ id: user.id, email: user.email ?? null });
    result = await load();
  }
  if (result.error) throw new Error(result.error.message);
  return (result.data?.activation && typeof result.data.activation === 'object') ? result.data.activation : {};
}

async function saveProfileActivationStore(db: any, user: any, activation: any, store: WorkspaceStore) {
  const nextActivation = {
    ...(activation && typeof activation === 'object' ? activation : {}),
    [STORE_KEY]: sanitizeWorkspaceStore(store),
  };
  const { error } = await db.from('profiles').update({ activation: nextActivation }).eq('id', user.id);
  if (error) throw new Error(error.message);
  return nextActivation;
}

async function saveMetadataStore(db: any, userId: string, meta: any, store: WorkspaceStore) {
  const nextMeta = sanitizeUserMetadata({
    ...meta,
    [STORE_KEY]: sanitizeWorkspaceStore(store),
  });
  const { error } = await db.auth.admin.updateUserById(userId, {
    user_metadata: nextMeta,
  });
  if (error) throw new Error(error.message);
}

type UserRecordState = {
  user: any;
  store: WorkspaceStore;
  mode: 'profile' | 'metadata';
  activation: any;
  meta: any;
};

async function loadUserRecord(db: any, userId: string): Promise<UserRecordState> {
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error || !data?.user) throw new Error(error?.message || 'User not found');
  const user = data.user;

  const rawMeta = (user.user_metadata && typeof user.user_metadata === 'object') ? user.user_metadata : {};
  const legacyStore = sanitizeWorkspaceStore(normalizeStore((rawMeta as any)[STORE_KEY]));
  const cleanMeta = sanitizeUserMetadata(rawMeta, { stripWorkspaceStore: true });
  if (JSON.stringify(cleanMeta) !== JSON.stringify(rawMeta)) {
    await db.auth.admin.updateUserById(userId, { user_metadata: cleanMeta });
  }

  try {
    let activation = await loadProfileActivation(db, user);
    let store = sanitizeWorkspaceStore(normalizeStore((activation as any)[STORE_KEY]));
    if (!storeHasData(store) && storeHasData(legacyStore)) {
      activation = await saveProfileActivationStore(db, user, activation, legacyStore);
      store = sanitizeWorkspaceStore(normalizeStore((activation as any)[STORE_KEY]));
    }
    return { user, store, mode: 'profile', activation, meta: cleanMeta };
  } catch {
    return { user, store: legacyStore, mode: 'metadata', activation: {}, meta: sanitizeUserMetadata(rawMeta) };
  }
}

function cloneWorkspace(workspace: WorkspaceRecord): WorkspaceRecord {
  return JSON.parse(JSON.stringify(workspace));
}

async function saveUserStore(db: any, record: UserRecordState, store: WorkspaceStore) {
  if (record.mode === 'profile') {
    record.activation = await saveProfileActivationStore(db, record.user, record.activation, store);
    return;
  }
  await saveMetadataStore(db, record.user.id, record.meta, store);
}

async function removeWorkspaceFromUser(db: any, userId: string, workspaceId: string) {
  const record = await loadUserRecord(db, userId);
  const { store } = record;
  const nextStore = {
    ...store,
    workspaces: (store.workspaces || []).filter((ws) => ws.id !== workspaceId),
    invitations: (store.invitations || []).filter((invite) => invite.workspaceId !== workspaceId),
    notifications: (store.notifications || []).filter((item) => !(item.kind === 'workspace-invite' && item.link === '/workspaces')),
  };
  await saveUserStore(db, record, nextStore);
}

async function loadProfileName(db: any, userId: string, email?: string) {
  try {
    const { data } = await db.from('profiles').select('name, email').eq('id', userId).single();
    return {
      name: data?.name || email?.split('@')[0] || 'Teammate',
      email: data?.email || email || '',
    };
  } catch {
    return {
      name: email?.split('@')[0] || 'Teammate',
      email: email || '',
    };
  }
}

export function isMissingWorkspaceSchemaError(error: any) {
  const msg = String(error?.message || error || '');
  return /Could not find the table|schema cache|relation .* does not exist/i.test(msg);
}

export async function loadFallbackWorkspacesForUser(db: any, userId: string) {
  const { store } = await loadUserRecord(db, userId);
  return store.workspaces
    .map((ws) => ({
      ...ws,
      currentUserRole: ws.members.find((m) => m.user_id === userId)?.role || 'viewer',
    }))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function loadFallbackWorkspaceBundleForUser(db: any, userId: string) {
  const { store } = await loadUserRecord(db, userId);
  return {
    workspaces: await loadFallbackWorkspacesForUser(db, userId),
    invitations: (store.invitations || [])
      .filter((invite) => invite.status === 'pending')
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
  };
}

export async function createFallbackWorkspace(db: any, user: any, name: string) {
  const record = await loadUserRecord(db, user.id);
  const { store } = record;
  const profile = await loadProfileName(db, user.id, user.email);
  const workspace: WorkspaceRecord = {
    id: makeId(),
    name,
    owner_id: user.id,
    created_at: new Date().toISOString(),
    members: [{ user_id: user.id, role: 'owner', name: profile.name, email: profile.email }],
    approvals: [],
  };
  const nextStore = {
    ...store,
    workspaces: [workspace, ...store.workspaces.filter((ws) => ws.id !== workspace.id)],
  };
  await saveUserStore(db, record, nextStore);
  return workspace;
}

async function syncWorkspaceToMembers(db: any, workspace: WorkspaceRecord) {
  const memberIds = [...new Set(workspace.members.map((m) => m.user_id))];
  for (const memberId of memberIds) {
    const record = await loadUserRecord(db, memberId);
    const { store } = record;
    const nextStore = {
      ...store,
      workspaces: [cloneWorkspace(workspace), ...store.workspaces.filter((ws) => ws.id !== workspace.id)],
    };
    await saveUserStore(db, record, nextStore);
  }
}

export async function inviteFallbackMember(db: any, actor: any, workspaceId: string, targetProfile: any, role: string) {
  const { store } = await loadUserRecord(db, actor.id);
  const workspace = store.workspaces.find((ws) => ws.id === workspaceId);
  if (!workspace) throw new Error('Workspace not found.');

  const actorRole = workspace.members.find((m) => m.user_id === actor.id)?.role;
  if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
    throw new Error('Only workspace owners or admins can invite teammates.');
  }

  const safeRole: WorkspaceRole = ['admin', 'editor', 'viewer', 'approver'].includes(role) ? role as WorkspaceRole : 'editor';
  const nextMembers = [
    ...workspace.members.filter((m) => m.user_id !== targetProfile.id),
    {
      user_id: targetProfile.id,
      role: safeRole,
      name: targetProfile.name || targetProfile.email?.split('@')[0] || 'Teammate',
      email: targetProfile.email || '',
    },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const nextWorkspace = { ...workspace, members: nextMembers };
  await syncWorkspaceToMembers(db, nextWorkspace);
  return nextWorkspace;
}

export async function removeFallbackMember(db: any, actor: any, workspaceId: string, targetUserId: string) {
  const { store } = await loadUserRecord(db, actor.id);
  const workspace = store.workspaces.find((ws) => ws.id === workspaceId);
  if (!workspace) throw new Error('Workspace not found.');

  const actorRole = workspace.members.find((m) => m.user_id === actor.id)?.role;
  if (!actorRole || !['owner', 'admin'].includes(actorRole)) {
    throw new Error('You do not have permission to remove members.');
  }

  const target = workspace.members.find((m) => m.user_id === targetUserId);
  if (!target) throw new Error('Member not found.');
  if (target.role === 'owner') throw new Error('Workspace owner cannot be removed.');

  const nextWorkspace = {
    ...workspace,
    members: workspace.members.filter((m) => m.user_id !== targetUserId),
  };

  await syncWorkspaceToMembers(db, nextWorkspace);
  await removeWorkspaceFromUser(db, targetUserId, workspaceId);
  return nextWorkspace;
}

export async function createWorkspaceInvitation(db: any, actor: any, targetProfile: any, workspace: { id: string; name: string }, role: string) {
  const record = await loadUserRecord(db, targetProfile.id);
  const { store } = record;
  const actorProfile = await loadProfileName(db, actor.id, actor.email);
  const safeRole: WorkspaceRole = ['admin', 'editor', 'viewer', 'approver'].includes(role) ? role as WorkspaceRole : 'editor';
  const invitationId = makeId();
  const createdAt = new Date().toISOString();
  const invitation: WorkspaceInvite = {
    id: invitationId,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    inviterId: actor.id,
    inviterName: actorProfile.name,
    inviterEmail: actor.email || actorProfile.email || '',
    role: safeRole,
    status: 'pending',
    created_at: createdAt,
  };
  const notification: WorkspaceNotification = {
    id: `invite-${invitationId}`,
    title: 'Workspace invitation',
    body: `${invitation.inviterName || invitation.inviterEmail} invited you to join ${workspace.name} as ${safeRole}.`,
    icon: '👥',
    color: 'sky',
    unread: true,
    link: '/workspaces',
    created_at: createdAt,
    kind: 'workspace-invite',
    invitationId,
  };

  const nextStore = {
    ...store,
    invitations: [invitation, ...(store.invitations || []).filter((item) => item.id !== invitation.id)],
    notifications: [notification, ...(store.notifications || []).filter((item) => item.id !== notification.id)].slice(0, 100),
  };
  await saveUserStore(db, record, nextStore);
  return invitation;
}

export async function getWorkspaceInvitation(db: any, userId: string, invitationId: string) {
  const { store } = await loadUserRecord(db, userId);
  return (store.invitations || []).find((invite) => invite.id === invitationId) || null;
}

export async function resolveWorkspaceInvitation(db: any, userId: string, invitationId: string, status: 'accepted' | 'declined') {
  const record = await loadUserRecord(db, userId);
  const { store } = record;
  const invite = (store.invitations || []).find((item) => item.id === invitationId);
  if (!invite) throw new Error('Invitation not found.');

  const nextStore = {
    ...store,
    invitations: (store.invitations || []).map((item) => item.id === invitationId
      ? { ...item, status, responded_at: new Date().toISOString() }
      : item),
    notifications: (store.notifications || []).map((item) => item.invitationId === invitationId
      ? { ...item, unread: false }
      : item),
  };
  await saveUserStore(db, record, nextStore);
  return invite;
}

export async function acceptFallbackWorkspaceInvitation(db: any, invitedUser: any, invitationId: string) {
  const invite = await getWorkspaceInvitation(db, invitedUser.id, invitationId);
  if (!invite || invite.status !== 'pending') throw new Error('Invitation not found.');

  const { store } = await loadUserRecord(db, invite.inviterId);
  const workspace = store.workspaces.find((ws) => ws.id === invite.workspaceId);
  if (!workspace) throw new Error('Workspace not found.');
  const invitedProfile = await loadProfileName(db, invitedUser.id, invitedUser.email);

  const nextWorkspace = {
    ...workspace,
    members: [
      ...workspace.members.filter((member) => member.user_id !== invitedUser.id),
      {
        user_id: invitedUser.id,
        role: invite.role,
        name: invitedProfile.name,
        email: invitedProfile.email,
      },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  };
  await syncWorkspaceToMembers(db, nextWorkspace);
  await resolveWorkspaceInvitation(db, invitedUser.id, invitationId, 'accepted');
  return nextWorkspace;
}

export async function declineWorkspaceInvitation(db: any, userId: string, invitationId: string) {
  await resolveWorkspaceInvitation(db, userId, invitationId, 'declined');
}

export async function loadFallbackNotifications(db: any, userId: string) {
  const { store } = await loadUserRecord(db, userId);
  return (store.notifications || []).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export async function markFallbackNotificationsRead(db: any, userId: string, opts?: { id?: string; all?: boolean }) {
  const record = await loadUserRecord(db, userId);
  const { store } = record;
  const nextStore = {
    ...store,
    notifications: (store.notifications || []).map((item) => {
      if (opts?.all) return { ...item, unread: false };
      if (opts?.id && item.id === opts.id) return { ...item, unread: false };
      return item;
    }),
  };
  await saveUserStore(db, record, nextStore);
}

export async function loadFallbackApprovalData(db: any, userId: string) {
  const workspaces = await loadFallbackWorkspacesForUser(db, userId);
  const approvals = workspaces.flatMap((ws: any) =>
    (Array.isArray(ws.approvals) ? ws.approvals : []).map((approval: WorkspaceApproval) => ({
      ...approval,
      workspaceName: ws.name,
      canReview: ['owner', 'admin', 'approver'].includes(ws.currentUserRole),
    })),
  ).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return {
    workspaces: workspaces.map((ws: any) => ({ id: ws.id, name: ws.name, role: ws.currentUserRole })),
    approvals,
  };
}

export async function createFallbackApproval(
  db: any,
  user: any,
  workspaceId: string,
  title: string,
  message: string,
  score: number | null,
  target?: { targetId?: string; targetType?: 'campaign-builder' | 'content-studio' | ''; targetLink?: string },
) {
  const { store } = await loadUserRecord(db, user.id);
  const workspace = store.workspaces.find((ws) => ws.id === workspaceId);
  if (!workspace) throw new Error('You are not a member of that workspace.');

  const approval: WorkspaceApproval = {
    id: makeId(),
    workspaceId,
    title,
    message,
    targetId: target?.targetId || '',
    targetType: target?.targetType || '',
    targetLink: target?.targetLink || '',
    status: 'pending',
    score,
    requested_by: user.id,
    requestedBy: user.email || 'Teammate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const nextWorkspace = {
    ...workspace,
    approvals: [approval, ...(Array.isArray(workspace.approvals) ? workspace.approvals : [])],
  };
  await syncWorkspaceToMembers(db, nextWorkspace);
  return approval;
}

export async function updateFallbackApprovalStatus(db: any, user: any, approvalId: string, status: 'pending' | 'approved' | 'changes', reviewNote: string) {
  const { store } = await loadUserRecord(db, user.id);
  const workspace = store.workspaces.find((ws) => Array.isArray(ws.approvals) && ws.approvals.some((a) => a.id === approvalId));
  if (!workspace) throw new Error('Approval request not found.');

  const currentRole = workspace.members.find((m) => m.user_id === user.id)?.role;
  if (!currentRole || !['owner', 'admin', 'approver'].includes(currentRole)) {
    throw new Error('You do not have approval rights in this workspace.');
  }

  const nextWorkspace = {
    ...workspace,
    approvals: (workspace.approvals || []).map((approval) => approval.id === approvalId
      ? { ...approval, status, reviewNote, updated_at: new Date().toISOString() }
      : approval),
  };
  await syncWorkspaceToMembers(db, nextWorkspace);
}
