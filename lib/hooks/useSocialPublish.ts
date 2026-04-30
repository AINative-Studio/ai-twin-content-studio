'use client';

import { useMutation } from '@tanstack/react-query';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'youtube';

export interface PublishRequest {
  reel_url: string;
  caption: string;
  platforms: Platform[];
  account_id: string;
  scheduled_at?: string;
}

export interface PublishResult {
  results: Array<{ platform: Platform; task_id: string; status: string }>;
}

export function useSocialPublish() {
  return useMutation<PublishResult, Error, PublishRequest>({
    mutationFn: async (payload) => {
      const res = await fetch(`${BASE}/social/publish`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Publish failed: ${res.status}`);
      return res.json();
    },
  });
}

export function useSocialConnect(platform: Platform) {
  return () => {
    window.location.href = `${BASE}/social/connect/${platform}`;
  };
}
