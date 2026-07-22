import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const LEGACY_ADMIN_EMAILS = new Set(['oannoreric@gmail.com']);

function allowedAdminEmails() {
  const envEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...envEmails, ...Array.from(LEGACY_ADMIN_EMAILS)]);
}

async function getAuthedUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!token) return null;
  const db = supabaseAdmin();
  const { data, error } = await db.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

async function canAccessAdmin(userId: string, email?: string | null) {
  const adminEmails = allowedAdminEmails();
  if (email && adminEmails.has(email.toLowerCase())) return true;
  const db = supabaseAdmin();
  const { data: profile } = await db
    .from('profiles')
    .select('role,is_admin,unlimited_credits')
    .eq('id', userId)
    .single();
  return profile?.role === 'admin' || profile?.is_admin === true || profile?.unlimited_credits === true;
}

async function countByUser(table: string, userId: string) {
  const db = supabaseAdmin();
  const { count, error } = await db
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) return 0;
  return count ?? 0;
}

async function getCustomerBaseRows() {
  const db = supabaseAdmin();
  
  try {
    const { data: profiles, error } = await db
      .from('profiles')
      .select('id,email,name,plan,role,created_at,credits,is_admin,unlimited_credits')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return [];

    return (profiles || []).map((p: any) => ({
      id: p.id,
      email: p.email || '',
      name: p.name || 'Unknown',
      plan: p.plan || 'trial',
      role: p.role || 'user',
      credits: typeof p.credits === 'number' ? p.credits : null,
      created_at: p.created_at || null,
      is_admin: p.is_admin === true,
      unlimited_credits: p.unlimited_credits === true,
    }));
  } catch (e) {
    console.error('Error fetching customers:', e);
    return [];
  }
}

async function statsHandler(req: NextRequest) {
  try {
    const user = await getAuthedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allowed = await canAccessAdmin(user.id, user.email);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const db = supabaseAdmin();
    
    let statsData: any = {
      total_users: 0,
      trial_users: 0,
      paid_users: 0,
      active_subs: 0,
      mrr: 0,
      revenue_total: 0,
      signups_30d: 0,
      by_plan: {},
      recent_payments: [],
    };

    try {
      const { data, error } = await db.rpc('admin_stats');
      if (error) {
        console.warn('admin_stats RPC error:', error.message);
      } else if (data) {
        statsData = { ...statsData, ...data };
      }
    } catch (rpcErr) {
      console.warn('admin_stats RPC exception:', rpcErr);
    }

    let users: any[] = [];
    try {
      users = await getCustomerBaseRows();
    } catch (usersErr) {
      console.error('Error fetching customers:', usersErr);
      users = [];
    }

    const customersWithUsage = await Promise.all(
      users.slice(0, 100).map(async (u: any) => {
        try {
          const [contentCount, campaignCount, paymentCount] = await Promise.all([
            countByUser('content', u.id),
            countByUser('campaigns', u.id),
            countByUser('payments', u.id),
          ]);

          return {
            id: u.id,
            email: u.email,
            name: u.name,
            plan: u.plan,
            role: u.role,
            credits: u.credits,
            created_at: u.created_at,
            usage: {
              content: contentCount,
              campaigns: campaignCount,
              payments: paymentCount,
              requests_total: contentCount + campaignCount,
            },
          };
        } catch (err) {
          console.warn('Error processing customer:', u.id, err);
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            plan: u.plan,
            role: u.role,
            credits: u.credits,
            created_at: u.created_at,
            usage: {
              content: 0,
              campaigns: 0,
              payments: 0,
              requests_total: 0,
            },
          };
        }
      })
    );

    return NextResponse.json({
      data: {
        ...statsData,
        customers: customersWithUsage,
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
