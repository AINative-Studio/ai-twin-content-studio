# AI Twin Content Studio

> One platform to script, produce, and publish AI avatar short-form content across Instagram, TikTok, LinkedIn, and YouTube Shorts.

Powered entirely by [AINative Studio APIs](https://ainative.studio) — no OpenAI dependency.

## What it does

- **Script Generator** — AI-written scripts with tone presets, streamed in real-time
- **AI Twin Library** — Create and manage multiple avatar personas with style presets
- **Video Studio** — TTS voiceover, Whisper captions with timeline editor, avatar generation
- **Bulk Reel Builder** — CSV → 100+ rendered reels via async queue
- **Multi-platform Publishing** — Instagram, TikTok, LinkedIn, YouTube Shorts with scheduling
- **Analytics Dashboard** — Cross-platform metrics, twin performance, PDF/CSV export

## Tech Stack

Next.js 15 · Tailwind CSS v4 · shadcn/ui · Zustand · TanStack Query · dnd-kit · FullCalendar · Recharts

## AINative APIs Used

| Capability | Endpoint |
|---|---|
| Script generation | `POST /chat/completions` (Claude / MiniMax / NousCoder) |
| Text-to-speech | `POST /multimodal/tts` |
| Avatar video generation | `POST /multimodal/avatar/generate` |
| Whisper transcription | `POST /audio/transcribe` |
| Embeddings | `POST /embeddings/generate` (free) |
| Creator memory | `POST /memory/v2/remember` + `/recall` |
| File storage | ZeroDB file API |

**Base URL:** `https://api.ainative.studio/api/v1/public`

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in AINATIVE_API_KEY, JWT_SECRET

# Run dev server
npm run dev
```

## Deployment

Deployed on Railway under the AINative-Studio workspace. Target domain: `studio.ainative.studio`

```bash
railway up
```

## Documentation

- [Full PRD](docs/PRD.md)
- [AINative API Docs](https://docs.ainative.studio)
- [Backend Issues](https://github.com/AINative-Studio/core/issues?q=ai+twin)

## Backend Gap Issues

These core API features are being built in parallel:

| Issue | Feature |
|---|---|
| [core#2608](https://github.com/AINative-Studio/core/issues/2608) | Content Calendar API |
| [core#2609](https://github.com/AINative-Studio/core/issues/2609) | Bulk Reel Queue |
| [core#2610](https://github.com/AINative-Studio/core/issues/2610) | Caption Generation + Burn-in |
| [core#2611](https://github.com/AINative-Studio/core/issues/2611) | AI Twin Library CRUD |
| [core#2612](https://github.com/AINative-Studio/core/issues/2612) | Instagram + TikTok Publishing |
| [core#2613](https://github.com/AINative-Studio/core/issues/2613) | LinkedIn + YouTube Publishing |
| [core#2614](https://github.com/AINative-Studio/core/issues/2614) | Social Analytics Aggregation |
| [core#2615](https://github.com/AINative-Studio/core/issues/2615) | Avatar API Wrapper |
