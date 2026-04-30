/**
 * Avatar render completion webhook receiver.
 * Backend fires this when /multimodal/avatar/generate finishes.
 * Payload: { task_id, twin_id, output_url, credits_used, duration_seconds }
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  const sig = req.headers.get('x-ainative-signature');
  if (secret && sig !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await req.json();
  const { task_id, twin_id, output_url, credits_used, duration_seconds } = payload;

  // In production: emit to SSE / push notification / update DB cache
  console.log('Avatar render complete', { task_id, twin_id, output_url, credits_used, duration_seconds });

  return NextResponse.json({ received: true });
}
