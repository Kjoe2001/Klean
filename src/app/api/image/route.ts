import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await req.json().catch(() => null);
  return NextResponse.json({
    error: 'Image generation has been disabled on this platform.',
    code: 'image_generation_disabled',
  }, { status: 410 });
}
