'use client';

/**
 * Bulk Reel Builder — CSV upload → Celery fan-out → useTask polls batch progress.
 * useCredits shows live credit burn as reels complete.
 */
import { StreamingIndicator } from '@ainative/aikit-react';
import { useCredits } from '@ainative/react-sdk';
import { useRef, useState } from 'react';
import { useTask } from '@/lib/hooks/useTask';
import { useTwins } from '@/lib/hooks/useTwins';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

interface ReelResult {
  reel_id: string;
  status: string;
  url?: string;
  error?: string;
}

interface BulkResult {
  batch_id: string;
  status: string;
  progress: number;
  reels: ReelResult[];
}

export default function BulkReelPage() {
  const { data: twins = [] } = useTwins();
  const { credits } = useCredits();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedTwinId, setSelectedTwinId] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [batchTaskId, setBatchTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: batchTask } = useTask<BulkResult>(batchTaskId);

  async function handleSubmit() {
    const file = fileRef.current?.files?.[0];
    if (!file || !selectedTwinId) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);
      formData.append('twin_id', selectedTwinId);
      formData.append('platform', platform);
      const res = await fetch(`${BASE}/bulk/reels`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey() },
        body: formData,
      });
      const data = await res.json();
      setBatchTaskId(data.batch_id);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isProcessing = batchTask?.status === 'queued' || batchTask?.status === 'processing';
  const isDone = batchTask?.status === 'done';
  const reels: ReelResult[] = batchTask?.result?.reels ?? [];

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Bulk Reel Builder</h1>
        {credits != null && (
          <span className="text-sm text-gray-400">
            <span className="text-[#4B6FED] font-medium">{credits.toLocaleString()}</span> credits remaining
          </span>
        )}
      </div>

      <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">AI Twin</label>
          <select
            value={selectedTwinId}
            onChange={(e) => setSelectedTwinId(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4B6FED]"
          >
            <option value="">Select a twin</option>
            {twins.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4B6FED]"
          >
            {['instagram', 'tiktok', 'linkedin', 'youtube'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">CSV File (max 100 rows)</label>
          <p className="text-xs text-gray-600 mb-2">Columns: script, title, hashtags (optional)</p>
          <input ref={fileRef} type="file" accept=".csv" className="text-sm text-gray-400 file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-[#4B6FED] file:text-white file:text-sm file:cursor-pointer" />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedTwinId || isSubmitting || isProcessing}
          className="w-full py-2.5 rounded-lg bg-[#4B6FED] text-white font-medium hover:bg-[#3a5edc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Uploading...' : isProcessing ? `Processing ${batchTask?.progress ?? 0}%` : 'Start Bulk Render'}
        </button>
      </div>

      {isProcessing && (
        <div className="p-4 rounded-xl border border-[#4B6FED]/20 bg-[#4B6FED]/5 space-y-2">
          <StreamingIndicator />
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-[#4B6FED] h-1.5 rounded-full transition-all" style={{ width: `${batchTask?.progress ?? 0}%` }} />
          </div>
          <p className="text-xs text-gray-400">Rendering reels in parallel... credits deducted per completion.</p>
        </div>
      )}

      {(isProcessing || isDone) && reels.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-white font-semibold text-sm">Reel Results</h2>
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
            {reels.map((reel, i) => (
              <div key={reel.reel_id ?? i} className="flex items-center justify-between px-4 py-2.5 bg-white/5">
                <span className="text-sm text-gray-400 font-mono">{reel.reel_id ?? `reel-${i + 1}`}</span>
                <div className="flex items-center gap-3">
                  {reel.status === 'done' && reel.url && (
                    <a href={reel.url} target="_blank" rel="noreferrer" className="text-xs text-[#4B6FED] hover:underline">Download</a>
                  )}
                  {reel.error && <span className="text-xs text-red-400">{reel.error}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    reel.status === 'done' ? 'bg-green-500/20 text-green-400' :
                    reel.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{reel.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
