'use client';

/**
 * Script Generator — useChat from @ainative/react-sdk streams scripts via
 * POST /chat/completions. Twin persona injects into system prompt via
 * useMemoryRecall (ZeroMemory v2 /memory/v2/recall).
 */
import { useChat } from '@ainative/react-sdk';
import { StreamingMessage, StreamingIndicator } from '@ainative/aikit-react';
import { useState } from 'react';
import { useMemoryRecall } from '@/lib/hooks/useMemory';
import { useTwins } from '@/lib/hooks/useTwins';

const TONE_PRESETS = ['Casual', 'Professional', 'Motivational', 'Educational', 'Humorous'];

export default function ScriptGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Casual');
  const [selectedTwinId, setSelectedTwinId] = useState('');
  const [platform, setPlatform] = useState('instagram');

  const { data: twins = [] } = useTwins();
  const selectedTwin = twins.find((t) => t.id === selectedTwinId);

  const { data: memory } = useMemoryRecall(
    selectedTwin ? `twin_${selectedTwin.id}` : '',
    topic,
  );

  const personaContext = selectedTwin?.persona_prompt ?? '';
  const memoryContext = memory?.results?.map((m: { content: string }) => m.content).join('\n') ?? '';

  const systemPrompt = [
    'You are an AI content script writer for short-form video.',
    `Platform: ${platform}. Tone: ${tone}.`,
    personaContext ? `Twin persona: ${personaContext}` : '',
    memoryContext ? `Creator memory context:\n${memoryContext}` : '',
    'Write a punchy, under-60-second script. Include a hook, body, and CTA.',
  ].filter(Boolean).join('\n');

  const { messages, sendMessage, isStreaming, error } = useChat({
    systemPrompt,
    stream: true,
    preferredModel: 'claude-3-5-sonnet-20241022',
  });

  function handleGenerate() {
    if (!topic.trim()) return;
    sendMessage(`Write a ${tone.toLowerCase()} ${platform} script about: ${topic}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Script Generator</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">AI Twin</label>
          <select
            value={selectedTwinId}
            onChange={(e) => setSelectedTwinId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4B6FED]"
          >
            <option value="">No twin (generic)</option>
            {twins.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#4B6FED]"
          >
            {['instagram', 'tiktok', 'linkedin', 'youtube'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONE_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  tone === t
                    ? 'border-[#4B6FED] bg-[#4B6FED]/20 text-[#4B6FED]'
                    : 'border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Topic</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why most devs ignore observability until prod is on fire"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#4B6FED] resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isStreaming}
          className="w-full py-2.5 rounded-lg bg-[#4B6FED] text-white font-medium hover:bg-[#3a5edc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? 'Generating...' : 'Generate Script'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      <div className="space-y-4">
        {isStreaming && <StreamingIndicator />}
        {messages
          .filter((m) => m.role === 'assistant')
          .map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <StreamingMessage
                content={m.content}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
