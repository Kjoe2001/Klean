import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * NOTE: only `profiles`, `credit_log` and `brands` actually exist in the
 * production database right now. `content`/`images`/`campaigns`/`payments`/
 * `subscriptions` are declared in supabase/schema.sql but were never
 * migrated, so this route deliberately doesn't query them — it derives real
 * numbers only from what's actually there. Generated content itself lives in
 * profiles.activation.generated_items (see saveGeneratedItem in
 * /api/generate/route.ts), not in a `content` table.
 */

function generatedCount(activation: any) {
  const items = activation && Array.isArray(activation.generated_items) ? activation.generated_items : [];
  return items.length;
}

async function statsHandler(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const db = supabaseAdmin();

    const { data: profiles, error: pErr } = await db
      .from('profiles')
      .select('id,email,name,company,industry,country,plan,role,created_at,credits,unlimited_credits,plan_started_at,trial_started_at,activation')
      .order('created_at', { ascending: false })
      .limit(500);

    if (pErr) {
      return NextResponse.json({ error: 'Failed to load users: ' + pErr.message }, { status: 500 });
    }

    const rows = profiles || [];
    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    const byPlan: Record<string, number> = {};
    let totalContent = 0;
    let totalCreditsHeld = 0;
    let signups30d = 0;

    const customers = rows.map((p: any) => {
      const plan = p.plan || 'trial';
      byPlan[plan] = (byPlan[plan] || 0) + 1;
      const contentCount = generatedCount(p.activation);
      totalContent += contentCount;
      if (typeof p.credits === 'number' && !p.unlimited_credits) totalCreditsHeld += p.credits;
      if (p.created_at && new Date(p.created_at).getTime() > thirtyDaysAgo) signups30d += 1;

      return {
        id: p.id,
        email: p.email || '',
        name: p.name || 'Unknown',
        company: p.company || null,
        industry: p.industry || null,
        country: p.country || null,
        plan,
        role: p.role || 'user',
        credits: typeof p.credits === 'number' ? p.credits : null,
        unlimited_credits: p.unlimited_credits === true,
        created_at: p.created_at || null,
        trial_started_at: p.trial_started_at || null,
        plan_started_at: p.plan_started_at || null,
        usage: { content: contentCount },
      };
    });

    return NextResponse.json({
      data: {
        total_users: rows.length,
        trial_users: byPlan['trial'] || 0,
        paid_users: rows.length - (byPlan['trial'] || 0),
        signups_30d: signups30d,
        by_plan: byPlan,
        total_content: totalContent,
        total_credits_held: totalCreditsHeld,
        customers,
      },
    });
  } catch (e: any) {
    console.error('statsHandler error:', e);
    return NextResponse.json(
      { error: 'Internal server error: ' + (e?.message || String(e)) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return statsHandler(req);
}

export async function POST(req: NextRequest) {
  return statsHandler(req);
}
