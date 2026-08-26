import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/* Single job: status polling, a signed download link once it is ready,
   and cancellation while it is still queued. */

export const runtime = 'nodejs';

const SIGNED_URL_TTL = 60 * 10; // 10 minutes

async function userFrom(req: NextRequest, db: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data } = await db.auth.getUser(token);
  return data?.user ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: job, error } = await db
    .from('download_jobs').select('*').eq('id', id).eq('user_id', user.id).single();

  if (error || !job) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let downloadUrl: string | null = null;
  if (job.status === 'ready' && job.output_path) {
    if (new Date(job.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ job: { ...job, status: 'expired' }, downloadUrl: null });
    }
    const { data: signed } = await db
      .storage.from('downloads').createSignedUrl(job.output_path, SIGNED_URL_TTL);
    downloadUrl = signed?.signedUrl ?? null;
  }

  return NextResponse.json({ job, downloadUrl });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const user = await userFrom(req, db);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: job } = await db
    .from('download_jobs').select('*').eq('id', id).eq('user_id', user.id).single();

  if (!job) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Only a job the worker has not started can be cancelled cleanly.
  if (!['queued', 'resolving'].includes(job.status)) {
    return NextResponse.json({ ok: false, error: 'not_cancellable', status: job.status }, { status: 409 });
  }

  await db.from('download_jobs')
    .update({ status: 'cancelled' }).eq('id', id);

  // Cancelled before any work landed — refund the credit.
  if (job.credits_spent > 0 && !job.refunded) {
    const { data: profile } = await db.from('profiles').select('credits').eq('id', user.id).single();
    const restored = (profile?.credits ?? 0) + job.credits_spent;
    await db.from('profiles').update({ credits: restored }).eq('id', user.id);
    await db.from('credit_log').insert({
      user_id: user.id, delta: job.credits_spent, balance_after: restored,
      reason: 'Refund — download cancelled',
    });
    await db.from('download_jobs').update({ refunded: true }).eq('id', id);
  }

  return NextResponse.json({ ok: true });
}
