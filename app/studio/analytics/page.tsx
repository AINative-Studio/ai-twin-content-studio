'use client';

/**
 * Analytics Dashboard — mirrors ainative.studio/ai-kit/dashboard visual design.
 * Same #0D1117 background, Recharts palette #4B6FED / #8A63F4.
 * useTask polls PDF/CSV export jobs.
 * createServerClient used in server action for SSR summary (see actions.ts).
 */
import { useCredits } from '@ainative/react-sdk';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { useTask } from '@/lib/hooks/useTask';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#4B6FED',
  tiktok: '#8A63F4',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
};

export default function AnalyticsPage() {
  const { credits } = useCredits();
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 28);
    return d.toISOString().split('T')[0];
  });
  const [to] = useState(() => new Date().toISOString().split('T')[0]);
  const [exportTaskId, setExportTaskId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('csv');

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['analytics', from, to],
    queryFn: async () => {
      const res = await fetch(`${BASE}/analytics/social?from=${from}&to=${to}`, {
        headers: { 'X-API-Key': getApiKey() },
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary', from, to],
    queryFn: async () => {
      const res = await fetch(`${BASE}/analytics/social/summary?from=${from}&to=${to}`, {
        headers: { 'X-API-Key': getApiKey() },
      });
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
  });

  const { data: exportTask } = useTask<{ download_url: string }>(exportTaskId);

  async function handleExport() {
    const res = await fetch(`${BASE}/analytics/social/export`, {
      method: 'POST',
      headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: exportFormat, from, to }),
    });
    const data = await res.json();
    setExportTaskId(data.task_id);
  }

  const platforms = ['instagram', 'tiktok', 'linkedin', 'youtube'];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex items-center gap-4">
          {credits != null && (
            <span className="text-sm text-gray-400">
              <span className="text-[#4B6FED] font-medium">{credits.toLocaleString()}</span> credits
            </span>
          )}
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportTask?.status === 'queued' || exportTask?.status === 'processing'}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {exportTask?.status === 'processing' ? 'Exporting...' : 'Export'}
            </button>
            {exportTask?.status === 'done' && exportTask?.result?.download_url && (
              <a href={exportTask.result.download_url} className="text-sm text-[#4B6FED] hover:underline">Download</a>
            )}
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((p) => {
            const s = summary[p];
            if (!s) return null;
            return (
              <div key={p} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{p}</div>
                <div className="text-2xl font-bold text-white">{(s.views ?? 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-0.5">views</div>
                {s.mom_delta != null && (
                  <div className={`text-xs mt-1 ${s.mom_delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.mom_delta >= 0 ? '+' : ''}{s.mom_delta}% MoM
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="p-5 rounded-xl border border-white/10 bg-white/5">
        <h2 className="text-white font-semibold mb-4">Views over time</h2>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Legend />
              {platforms.map((p) => (
                <Area key={p} type="monotone" dataKey={p} stroke={PLATFORM_COLORS[p]} fill={PLATFORM_COLORS[p]} fillOpacity={0.1} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="p-5 rounded-xl border border-white/10 bg-white/5">
        <h2 className="text-white font-semibold mb-4">Engagement by platform</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
            <Legend />
            {platforms.map((p) => (
              <Bar key={p} dataKey={`${p}_likes`} fill={PLATFORM_COLORS[p]} opacity={0.8} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
