import { NextRequest, NextResponse } from 'next/server';
import {
  checkJoynewsCredentials,
  createJoynewsSessionToken,
  JOYNEWS_COOKIE_NAME,
  JOYNEWS_SESSION_MAX_AGE_SECONDS,
} from '@/lib/joynews-auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!checkJoynewsCredentials(username, password)) {
    return NextResponse.json({ ok: false, error: 'Invalid username or password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(JOYNEWS_COOKIE_NAME, createJoynewsSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: JOYNEWS_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
