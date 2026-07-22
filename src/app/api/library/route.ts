import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

function dedupeItems(items: any[]) {
  return items.filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
}

async function loadLibraryItems(db: ReturnType<typeof admin>, userId: string) {
  let contentItems: any[] = [];
  try {
    const { data } = await db
      .from('content')
      .select('id, user_id, brand_id, type, title, body, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(150);
    contentItems = (data || []).map((item: any) => ({ ...item, source: 'content_table' }));
  } catch {}

  const { data: profile } = await db.from('profiles').select('activation').eq('id', userId).maybeSingle();
  const activation = profile?.activation && typeof profile.activation === 'object' ? profile.activation : {};
  const activationItems = Array.isArray((activation as any).generated_items)
    ? (activation as any).generated_items.map((item: any) => ({ ...item, source: 'activation' }))
    : [];

  return dedupeItems([...activationItems, ...contentItems])
    .sort((a, b) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0));
}

export async function GET(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const items = await loadLibraryItems(db, user.id);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load library' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!String(id || '').trim()) {
      return NextResponse.json({ error: 'Item id is required.' }, { status: 400 });
    }

    try {
      await db.from('content').delete().eq('id', String(id)).eq('user_id', user.id);
    } catch {}

    const { data: profile } = await db.from('profiles').select('activation').eq('id', user.id).maybeSingle();
    const activation = profile?.activation && typeof profile.activation === 'object' ? profile.activation : {};
    const generatedItems = Array.isArray((activation as any).generated_items) ? (activation as any).generated_items : [];
    const nextItems = generatedItems.filter((item: any) => item.id !== String(id));
    await db.from('profiles').update({ activation: { ...activation, generated_items: nextItems } }).eq('id', user.id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete library item' }, { status: 500 });
  }
}