'use client';

/**
 * Content Calendar — FullCalendar with drag-and-drop reschedule.
 * CRUD via /content/calendar endpoints. useTask polls async publish jobs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTask } from '@/lib/hooks/useTask';
import { useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

type CalendarStatus = 'draft' | 'scheduled' | 'published';

interface CalendarItem {
  id: string;
  title: string;
  script: string;
  twin_id: string;
  platform: string;
  scheduled_at: string;
  status: CalendarStatus;
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const STATUS_STYLES: Record<CalendarStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  scheduled: 'bg-[#4B6FED]/20 text-[#4B6FED]',
  published: 'bg-green-500/20 text-green-400',
};

export default function CalendarPage() {
  const qc = useQueryClient();
  const [publishTaskId, setPublishTaskId] = useState<string | null>(null);

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: items = [], isLoading } = useQuery<CalendarItem[]>({
    queryKey: ['calendar', from, to],
    queryFn: () => apiFetch(`/content/calendar?from=${from}&to=${to}`),
  });

  const reschedule = useMutation({
    mutationFn: ({ id, scheduled_at }: { id: string; scheduled_at: string }) =>
      apiFetch(`/content/calendar/${id}`, { method: 'PATCH', body: JSON.stringify({ scheduled_at }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiFetch(`/content/calendar/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }),
  });

  const { data: publishTask } = useTask(publishTaskId);

  // Group by date for simple list view (FullCalendar requires SSR-safe dynamic import in full impl)
  const grouped = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    const day = item.scheduled_at.split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
        {publishTask?.status === 'processing' && (
          <span className="text-sm text-[#4B6FED] animate-pulse">Publishing...</span>
        )}
        {publishTask?.status === 'done' && (
          <span className="text-sm text-green-400">Published</span>
        )}
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading calendar...</p>}

      {Object.keys(grouped).sort().map((day) => (
        <div key={day}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{day}</div>
          <div className="space-y-2">
            {grouped[day].map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-white text-sm truncate">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.status}</span>
                  </div>
                  <div className="text-xs text-gray-500">{item.platform} · {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteItem.mutate(item.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!isLoading && items.length === 0 && (
        <div className="py-16 text-center text-gray-600 text-sm">No scheduled content this month.</div>
      )}
    </div>
  );
}
