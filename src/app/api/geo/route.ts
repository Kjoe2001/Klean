import { NextRequest, NextResponse } from 'next/server';

/* Detects the visitor's country from Vercel's edge geo headers and returns
   a display currency + conversion rate. We DISPLAY local currency but bill in USD
   (Flutterwave settles in supported currencies), so we always show the USD too. */

const CURRENCY: Record<string, { code: string; symbol: string; rate: number }> = {
  GH: { code: 'GHS', symbol: 'GH₵', rate: 15.5 },
  NG: { code: 'NGN', symbol: '₦',  rate: 1600 },
  KE: { code: 'KES', symbol: 'KSh', rate: 129 },
  ZA: { code: 'ZAR', symbol: 'R',  rate: 18.2 },
  GB: { code: 'GBP', symbol: '£',  rate: 0.79 },
  EU: { code: 'EUR', symbol: '€',  rate: 0.92 },
  US: { code: 'USD', symbol: '$',  rate: 1 },
};

export async function GET(req: NextRequest) {
  // Vercel sets x-vercel-ip-country; fallback to US
  const country = (req.headers.get('x-vercel-ip-country') || 'US').toUpperCase();
  const cur = CURRENCY[country] || CURRENCY.US;
  return NextResponse.json({ country, ...cur });
}
