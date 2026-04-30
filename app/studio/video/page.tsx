'use client';

/**
 * Video Studio — TTS voiceover + avatar render + caption generation.
 * useTask polls render jobs (POST /multimodal/avatar/generate → task_id).
 * StreamingIndicator from @ainative/aikit-react shows during processing.
 */
import { StreamingIndicator } from '@ainative/aikit-react';
import { useCredits } from '@ainative/react-sdk';
import { useState } from 'react';
import { useTask } from '@/lib/hooks/useTask';
import { useTwins } from '@/lib/hooks/useTwins';

const BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
const getApiKey = () => process.env.NEXT_PUBLIC_AINATIVE_API_KEY ?? '';

export default function VideoStudioPage() {
  const { data: twins = [] } = useTwins();
  const { credits } = useCredits();
  const [script, setScript] = useState('');
  const [selectedTwinId, setSelectedTwinId] = useState('');
  const [renderTaskId, setRenderTaskId] = useState<string | null>(null);
  const [captionTaskId, setCaptionTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: renderTask } = useTask<{ output_url: string }>(renderTaskId);
  const { data: captionTask } = useTask<{ caption_id: string; srt: string }>(captionTaskId);

  async function handleRender() {
    if (!script.trim() || !selectedTwinId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE}/multimodal/avatar/generate`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ twin_id: selectedTwinId, script, quality: 'standard' }),
      });
      const data = await res.json();
      setRenderTaskId(data.task_id);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateCaptions() {
    if (!renderTask?.result?.output_url) return;
    const res = await fetch(`${BASE}/captions/generate`, {
      method: 'POST',
      headers: { 'X-API-Key': getApiKey(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ reel_url: renderTask.result.output_url }),
    });
    const data = await res.json();
    setCaptionTaskId(data.task_id);
  }

  const isRendering = renderTask?.status === 'queued' || renderTask?.status === 'processing';
  const renderDone = renderTask?.status === 'done';
  const isCaptioning = captionTask?.status === 'queued' || captionTask?.status === 'processing';

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Video Studio</h1>
        {credits != null && (
          <span className="text-sm text-gray-400">
            <span className="text-[#4B6FED] font-medium">{credits.toLocaleString()}</span> credits
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">AI Twin</label>
          <select
            value={selectedTwinId}
            onChange={(e) => setSelectedTwinId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4B6FED]"
          >
            <option value="">Select a twin</option>
            {twins.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Script</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your script here..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#4B6FED] resize-none font-mono text-sm"
          />
        </div>

        <button
          onClick={handleRender}
          disabled={!script.trim() || !selectedTwinId || isSubmitting || isRendering}
          className="w-full py-2.5 rounded-lg bg-[#8A63F4] text-white font-medium hover:bg-[#7a53e4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : isRendering ? `Rendering... ${renderTask?.progress ?? 0}%` : 'Render Avatar Video'}
        </button>
      </div>

      {isRendering && (
        <div className="p-4 rounded-xl border border-[#8A63F4]/20 bg-[#8A63F4]/5 space-y-2">
          <StreamingIndicator />
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-[#8A63F4] h-1.5 rounded-full transition-all"
              style={{ width: `${renderTask?.progress ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">Rendering via avatar engine... this takes ~30-60s</p>
        </div>
      )}

      {renderDone && renderTask?.result?.output_url && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <p className="text-green-400 text-sm font-medium mb-2">Render complete</p>
            <video src={renderTask.result.output_url} controls className="w-full rounded-lg" />
          </div>

          <button
            onClick={handleGenerateCaptions}
            disabled={isCaptioning}
            className="w-full py-2.5 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            {isCaptioning ? 'Generating captions...' : 'Generate Captions'}
          </button>

          {captionTask?.status === 'done' && captionTask?.result?.srt && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-sm text-gray-400 mb-2">Generated SRT</p>
              <pre className="text-xs text-gray-300 overflow-auto max-h-40 whitespace-pre-wrap">{captionTask.result.srt}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
