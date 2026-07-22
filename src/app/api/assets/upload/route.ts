import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

async function ensureAssetsBucket(db: ReturnType<typeof admin>) {
  const bucketName = 'assets';
  const { data: existing, error: getError } = await db.storage.getBucket(bucketName);
  if (!getError && existing) return;

  const { error: createError } = await db.storage.createBucket(bucketName, { public: true });
  if (createError && !/already exists/i.test(createError.message || '')) {
    throw new Error(`Could not create assets bucket: ${createError.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = admin();
    const user = await userFrom(req, db);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    await ensureAssetsBucket(db);

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await db.storage.from('assets').upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: pub } = db.storage.from('assets').getPublicUrl(path);
    return NextResponse.json({
      ok: true,
      url: pub.publicUrl,
      path,
      type: file.type || 'application/octet-stream',
      size: file.size,
      name: file.name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
