'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

export interface Twin {
  id: string;
  name: string;
  avatar_url: string;
  voice_id: string;
  style_tags: string[];
  persona_prompt: string;
  platform_defaults: Record<string, unknown>;
  memory_namespace: string;
  created_at: string;
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useTwins() {
  return useQuery<Twin[]>({ queryKey: ['twins'], queryFn: () => apiFetch('/twins') });
}

export function useTwin(id: string) {
  return useQuery<Twin>({ queryKey: ['twins', id], queryFn: () => apiFetch(`/twins/${id}`), enabled: !!id });
}

export function useCreateTwin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Twin>) => apiFetch('/twins', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['twins'] }),
  });
}

export function useUpdateTwin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Twin> & { id: string }) =>
      apiFetch(`/twins/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['twins'] }),
  });
}

export function useDeleteTwin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/twins/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['twins'] }),
  });
}
