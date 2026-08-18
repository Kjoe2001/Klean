import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { JOYNEWS_COOKIE_NAME, verifyJoynewsSessionToken } from '@/lib/joynews-auth';

const TEMPLATE_PATH = path.join(process.cwd(), 'src/lib/protected-templates/news-frame-joynews.html');

export async function GET(req: NextRequest) {
  const token = req.cookies.get(JOYNEWS_COOKIE_NAME)?.value;
  if (!verifyJoynewsSessionToken(token)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const html = await fs.readFile(TEMPLATE_PATH, 'utf8');
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
