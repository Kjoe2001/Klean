import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim());
  if (!admins.includes(email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = supabaseAdmin();
  const { data, error } = await db.rpc('admin_stats');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
