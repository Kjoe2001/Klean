import { NextRequest, NextResponse } from 'next/server';

/* Server-side AI image generation via Replicate (Flux Schnell — fast & cheap).
   If the paid provider is unavailable, we fall back to a public image URL so the
   studio still returns a visible image for the user. */

const SIZE_TO_AR: Record<string, string> = {
  '1024x1024': '1:1', '1024x1280': '4:5', '1280x720': '16:9',
  '720x1280': '9:16', '1200x628': '16:9',
};

function buildFallbackImageUrl(prompt: string, w: number, h: number) {
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: String(w),
    height: String(h),
    model: 'flux',
    nologo: 'true',
  });
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, w = 1024, h = 1024 } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    const aspect_ratio = SIZE_TO_AR[`${w}x${h}`] || '1:1';

    if (token) {
      try {
        // Create prediction (Flux Schnell: fast, ~$0.003/image)
        const create = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'wait',
          },
          body: JSON.stringify({ input: { prompt, aspect_ratio, output_format: 'jpg', num_outputs: 1 } }),
        });

        let pred = await create.json();
        if (pred?.error) throw new Error(pred.error);

        let tries = 0;
        while (pred.status && pred.status !== 'succeeded' && pred.status !== 'failed' && tries < 30) {
          await new Promise(r => setTimeout(r, 1000));
          const poll = await fetch(pred.urls?.get, { headers: { Authorization: `Bearer ${token}` } });
          pred = await poll.json();
          tries++;
        }

        if (pred.status !== 'failed') {
          const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
          if (url) return NextResponse.json({ url });
        }
      } catch (error: any) {
        console.warn('Replicate image generation failed, using fallback image URL', error?.message || error);
      }
    }

    const fallbackUrl = buildFallbackImageUrl(prompt, w, h);
    return NextResponse.json({ url: fallbackUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Image error' }, { status: 500 });
  }
}
