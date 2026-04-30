'use client';

/**
 * useTask — polls a backend async task until done or error.
 * Compatible with all AINative endpoints that return { task_id, status, progress, result }.
 */
import { useQuery } from '@tanstack/react-query';

export type TaskStatus = 'queued' | 'processing' | 'done' | 'error';

export interface TaskResult<T = unknown> {
  task_id: string;
  status: TaskStatus;
  progress: number; // 0-100
  result?: T;
  error?: string;
}

async function fetchTask<T>(taskId: string, baseUrl: string, apiKey: string): Promise<TaskResult<T>> {
  const res = await fetch(`${baseUrl}/tasks/${taskId}`, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) throw new Error(`Task fetch failed: ${res.status}`);
  return res.json();
}

export function useTask<T = unknown>(taskId: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
  const apiKey = process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

  return useQuery<TaskResult<T>>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTask<T>(taskId!, baseUrl, apiKey),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'done' || status === 'error' ? false : 2000;
    },
  });
}
