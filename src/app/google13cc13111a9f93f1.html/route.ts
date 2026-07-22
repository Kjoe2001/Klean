import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse('google-site-verification: google13cc13111a9f93f1.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
