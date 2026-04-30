'use client';

/**
 * AI Twin Library — CRUD for avatar personas.
 * Fetches via useTwins (TanStack Query).
 * useCredits from @ainative/react-sdk in header.
 */
import { useCredits } from '@ainative/react-sdk';
import { useTwins, useDeleteTwin, useCreateTwin, type Twin } from '@/lib/hooks/useTwins';
import { useState } from 'react';

export default function TwinsPage() {
  const { data: twins = [], isLoading } = useTwins();
  const deleteTwin = useDeleteTwin();
  const createTwin = useCreateTwin();
  const { credits } = useCredits();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Twin>>({ name: '', voice_id: '', persona_prompt: '', style_tags: [] });

  function handleCreate() {
    createTwin.mutate(form, { onSuccess: () => { setShowForm(false); setForm({ name: '', voice_id: '', persona_prompt: '', style_tags: [] }); } });
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">AI Twin Library</h1>
        <div className="flex items-center gap-4">
          {credits != null && (
            <span className="text-sm text-gray-400">
              <span className="text-[#4B6FED] font-medium">{credits.toLocaleString()}</span> credits
            </span>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-[#4B6FED] text-white text-sm font-medium hover:bg-[#3a5edc] transition-colors"
          >
            + New Twin
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl border border-[#4B6FED]/30 bg-[#4B6FED]/5 space-y-3">
          <h2 className="text-white font-semibold">New Twin</h2>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#4B6FED]"
          />
          <input
            placeholder="Voice ID (e.g. en-US-Neural2-D)"
            value={form.voice_id}
            onChange={(e) => setForm({ ...form, voice_id: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#4B6FED]"
          />
          <textarea
            placeholder="Persona prompt (e.g. Speak like a senior dev with dry humor)"
            value={form.persona_prompt}
            onChange={(e) => setForm({ ...form, persona_prompt: e.target.value })}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#4B6FED] resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!form.name || createTwin.isPending}
              className="px-4 py-2 rounded-lg bg-[#4B6FED] text-white text-sm font-medium hover:bg-[#3a5edc] disabled:opacity-50 transition-colors"
            >
              {createTwin.isPending ? 'Creating...' : 'Create Twin'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/30 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-gray-500">Loading twins...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {twins.map((twin) => (
          <div key={twin.id} className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-3">
            {twin.avatar_url && (
              <div className="w-12 h-12 rounded-full bg-[#4B6FED]/20 border border-[#4B6FED]/30 flex items-center justify-center text-xl">
                🤖
              </div>
            )}
            <div>
              <div className="font-semibold text-white">{twin.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">voice: {twin.voice_id || 'not set'}</div>
            </div>
            {twin.style_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {twin.style_tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-[#8A63F4]/20 text-[#8A63F4] border border-[#8A63F4]/20">{tag}</span>
                ))}
              </div>
            )}
            {twin.persona_prompt && (
              <p className="text-xs text-gray-400 line-clamp-2">{twin.persona_prompt}</p>
            )}
            <button
              onClick={() => deleteTwin.mutate(twin.id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
