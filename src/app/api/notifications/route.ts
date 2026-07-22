import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isMissingWorkspaceSchemaError, loadFallbackNotifications, markFallbackNotificationsRead } from '@/lib/workspace-store';

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

export async function GET(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    let tableNotifications: any[] = [];
    try {
      const { data, error } = await db
        .from('notifications')
        .select('id, title, body, read, color, link, created_at, icon')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      tableNotifications = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        unread: !row.read,
        color: row.color || 'primary',
        icon: row.icon || '✦',
        link: row.link || '',
        created_at: row.created_at,
        source: 'table',
      }));
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
    }

    const metaNotifications = (await loadFallbackNotifications(db, user.id)).map((row: any) => ({ ...row, source: 'meta' }));
    const notifications = [...metaNotifications, ...tableNotifications]
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    return NextResponse.json({ notifications, unread: notifications.filter((n) => n.unread).length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id, source, all } = await req.json();

    if (all) {
      try {
        await db.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
      } catch {}
      await markFallbackNotificationsRead(db, user.id, { all: true });
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: 'Notification id is required.' }, { status: 400 });
    if (source === 'meta') {
      await markFallbackNotificationsRead(db, user.id, { id: String(id) });
      return NextResponse.json({ ok: true });
    }

    try {
      await db.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
    } catch (e: any) {
      if (!isMissingWorkspaceSchemaError(e)) throw e;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update notifications' }, { status: 500 });
  }
}
