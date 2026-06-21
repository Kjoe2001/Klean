import { NextRequest, NextResponse } from 'next/server';

/* Server-side AI image generation via Replicate (Flux Schnell — fast & cheap).
   Token stays server-only. Returns a ready-to-use image URL. */

const SIZE_TO_AR: Record<string, string> = {
  '1024x1024': '1:1', '1024x1280': '4:5', '1280x720': '16:9',
  '720x1280': '9:16', '1200x628': '16:9',
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, w = 1024, h = 1024 } = await req.json();
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'Image generation not configured' }, { status: 500 });
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    const aspect_ratio = SIZE_TO_AR[`${w}x${h}`] || '1:1';

    // Create prediction (Flux Schnell: fast, ~$0.003/image)
    const create = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait', // wait for completion in one call when possible
      },
      body: JSON.stringify({ input: { prompt, aspect_ratio, output_format: 'jpg', num_outputs: 1 } }),
    });

    let pred = await create.json();
    if (pred?.error) return NextResponse.json({ error: pred.error }, { status: 500 });

    // Poll if not finished (fallback when Prefer:wait didn't fully resolve)
    let tries = 0;
    while (pred.status && pred.status !== 'succeeded' && pred.status !== 'failed' && tries < 30) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${token}` } });
      pred = await poll.json();
      tries++;
    }

    if (pred.status === 'failed') return NextResponse.json({ error: 'Generation failed' }, { status: 500 });

    const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
    if (!url) return NextResponse.json({ error: 'No image returned' }, { status: 500 });

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Image error' }, { status: 500 });
  }
}
