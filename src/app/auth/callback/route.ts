import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const plan = url.searchParams.get('plan');
  if (code) {
    const store = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => store.getAll(), setAll: (cs) => cs.forEach(c => store.set(c.name, c.value, c.options)) } });
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(plan ? `/checkout?plan=${plan}` : '/dashboard', req.url));
}
