import Link from 'next/link';

const nav = [
  { href: '/studio/script', label: 'Script Generator', description: 'AI-written scripts with tone presets, streamed in real-time' },
  { href: '/studio/twins', label: 'AI Twin Library', description: 'Create and manage avatar personas with style presets' },
  { href: '/studio/video', label: 'Video Studio', description: 'TTS voiceover, captions, avatar rendering' },
  { href: '/studio/bulk', label: 'Bulk Reel Builder', description: 'CSV → 100+ rendered reels via async queue' },
  { href: '/studio/calendar', label: 'Content Calendar', description: 'Schedule and manage publish jobs' },
  { href: '/studio/analytics', label: 'Analytics', description: 'Cross-platform metrics and export' },
];

export default function Home() {
  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">AI Twin Content Studio</h1>
        <p className="text-gray-400">Script, produce, and publish AI avatar content across Instagram, TikTok, LinkedIn, and YouTube Shorts.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nav.map(({ href, label, description }) => (
          <Link
            key={href}
            href={href}
            className="block p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#4B6FED]/50 transition-all"
          >
            <div className="font-semibold text-white mb-1">{label}</div>
            <div className="text-sm text-gray-400">{description}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
