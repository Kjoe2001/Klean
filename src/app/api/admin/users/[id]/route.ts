import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const db = supabaseAdmin();

  try {
    const [{ data: profile, error: profileErr }, { data: brands }, { data: creditLog }] = await Promise.all([
      db.from('profiles').select('*').eq('id', id).single(),
      db.from('brands').select('id,name,industry,audience,tone,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
      db.from('credit_log').select('id,delta,reason,balance_after,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(300),
    ]);

    if (profileErr || !profile) {
      return NextResponse.json({ error: profileErr?.message || 'User not found' }, { status: 404 });
    }

    // Generated content lives inside profiles.activation.generated_items — there is no
    // separate `content` table in production (see /api/generate/route.ts saveGeneratedItem).
    const activation = profile.activation && typeof profile.activation === 'object' ? profile.activation : {};
    const content = Array.isArray(activation.generated_items) ? activation.generated_items : [];

    return NextResponse.json({
      data: {
        profile,
        content,
        brands: brands || [],
        credit_log: creditLog || [],
      },
    });
  } catch (e: any) {
    console.error('admin user detail error:', e);
    return NextResponse.json({ error: 'Internal server error: ' + (e?.message || String(e)) }, { status: 500 });
  }
}
