import { NextResponse } from 'next/server';

const ANDROID_APK_URL = 'https://drive.google.com/uc?export=download&id=1uwFZdl8sBgaNi_tVXLGmrPOTrL08SPEm';

export async function GET() {
  return NextResponse.redirect(ANDROID_APK_URL, { status: 302 });
}
