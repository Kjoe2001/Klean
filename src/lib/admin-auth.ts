import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Admin dashboard access is deliberately narrower than the "unlimited credits"
 * perk (profile.is_admin / unlimited_credits) used elsewhere to comp free
 * generations — that flag can be granted to any customer as a courtesy and
 * must never also unlock every other user's data. Only an explicit email
 * allowlist (ADMIN_EMAILS env, plus the founder's account) can see this data.
 */
const OWNER_EMAIL = 'oannoreric@gmail.com';

function allowedAdminEmails() {
  const envEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...envEmails, OWNER_EMAIL]);
}

export async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  if (!token) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const db = supabaseAdmin();
  const { data, error } = await db.auth.getUser(token);
  const user = error ? null : data.user;
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const email = (user.email || '').toLowerCase();
  if (!allowedAdminEmails().has(email)) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, error: null };
}
