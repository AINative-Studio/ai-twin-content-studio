'use client';

/**
 * useMemory — recall creator memory from ZeroMemory v2 for personalization.
 * Namespace scoped to twin or user session.
 */
import { useQuery, useMutation } from '@tanstack/react-query';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';

function getApiKey() {
  return process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';
}

export function useMemoryRecall(namespace: string, query: string) {
  return useQuery({
    queryKey: ['memory', 'recall', namespace, query],
    queryFn: async () => {
      const res = await fetch(`${BASE}/memory/v2/recall`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace, query, top_k: 5 }),
      });
      if (!res.ok) throw new Error('Memory recall failed');
      return res.json();
    },
    enabled: !!namespace && !!query,
    staleTime: 60_000,
  });
}

export function useMemoryStore(namespace: string) {
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${BASE}/memory/v2/remember`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace, content }),
      });
      if (!res.ok) throw new Error('Memory store failed');
      return res.json();
    },
  });
}
