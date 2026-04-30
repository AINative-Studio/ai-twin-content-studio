/**
 * Social publish webhook receiver — Instagram, TikTok, LinkedIn, YouTube.
 * Receives confirmation callbacks after platform publish completes.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { platform, publish_id, task_id, status, platform_post_url } = payload;

  console.log('Social publish webhook', { platform, publish_id, task_id, status, platform_post_url });

  return NextResponse.json({ received: true });
}
