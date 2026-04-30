/**
 * OAuth callback handler for social platforms.
 * Backend at /social/connect/{platform} redirects here after OAuth.
 * We proxy the code to the backend callback endpoint and redirect to /studio/calendar.
 */
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) return NextResponse.redirect(new URL('/studio/calendar?error=oauth_cancelled', req.url));

  const backendUrl = `${BASE}/social/callback/${platform}?code=${code}${state ? `&state=${state}` : ''}`;
  const res = await fetch(backendUrl, {
    headers: { 'X-API-Key': process.env.AINATIVE_API_KEY! },
  });

  if (!res.ok) return NextResponse.redirect(new URL('/studio/calendar?error=oauth_failed', req.url));

  return NextResponse.redirect(new URL('/studio/calendar?connected=' + platform, req.url));
}
