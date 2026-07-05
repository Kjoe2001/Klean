import { NextRequest, NextResponse } from 'next/server';

// TEMPORARY BYPASS: simplified endpoint to help diagnose dev server responsiveness.
export async function POST(req: NextRequest) {
  try {
    console.log('image route bypass responding');
    return NextResponse.json({ ok: true, bypass: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
