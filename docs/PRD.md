# Product Requirements Document (PRD)
## AI Twin Content Studio — Frontend

**Prepared By:** AINative Studio  
**Date:** April 29, 2026  
**Version:** 3.0 (AI Kit + SDK Integration)  
**Original PRD:** Alexandra Mitchelson, June 19, 2025 v1.0  
**Status:** Active Development  

---

## 1. Purpose

AI Twin Content Studio is a web application that centralizes the entire workflow of AI-powered short-form educational content creation. It replaces a fragmented stack (CapCut, Snapchat, TikTok, Captions, etc.) with a single cohesive platform built **entirely on AINative libraries and APIs**.

**No OpenAI/ChatGPT dependency.** All AI capabilities are powered by:
- **`@ainative/next-sdk`** — server-side auth, server components, API route protection
- **`@ainative/react-sdk`** (re-exported from `@ainative/next-sdk/client`) — `useChat`, `useCredits`, `useMemory`, `useAgent`, `useTask`, `useThread`
- **`@ainative/aikit-react`** — `StreamingMessage`, `StreamingIndicator`, `CodeBlock` UI components
- **AINative API** at `https://api.ainative.studio/api/v1/public`

**AI Kit Dashboard reference:** https://ainative.studio/ai-kit — use this as the design reference for the analytics and usage dashboard.

---

## 2. AINative Library Surface

### `@ainative/next-sdk` (server)

```ts
import {
  createServerClient,      // Server Components, API routes, Server Actions
  createAgentServerClient, // Agent-specific server client
  createAgentWebhookHandler, // Webhook handler factory
  getSession,              // Get current auth session (App Router)
  getApiKey,               // Get API key from session cookie
  withAuth,                // Middleware: protect App Router routes
  withAuthPages,           // Middleware: protect Pages Router routes
} from '@ainative/next-sdk/server';
```

### `@ainative/next-sdk` (client) → wraps `@ainative/react-sdk`

```ts
import {
  AINativeProvider,  // Root provider — wraps entire app
  useAINative,       // Access provider config + base URL
  useChat,           // Chat completions with streaming (claude-sonnet-4-6, minimax, nouscoderv1)
  useCredits,        // Credit balance + usage tracking
  useAgent,          // Agent CRUD + lifecycle management
  useTask,           // Swarm task submission + status polling
  useMemory,         // ZeroMemory v2: remember, recall, forget
  useThread,         // Persistent conversation threads with search
} from '@ainative/next-sdk/client';
```

### `@ainative/aikit-react`

```ts
import {
  StreamingMessage,    // SSE/streaming chat message with markdown, code highlight, typewriter
  StreamingIndicator,  // Animated typing indicator
  CodeBlock,           // Syntax-highlighted code block
} from '@ainative/aikit-react';
```

### AI Kit UI Demos (live reference at https://ainative.studio/ai-kit)

| Demo | Path | What it shows |
|---|---|---|
| Streaming Chat | `/ai-kit/streaming` | `StreamingMessage` + `useChat` in action |
| Agent Orchestration | `/ai-kit/agents` | `useAgent` + `useTask` + swarm coordination |
| Safety & Moderation | `/ai-kit/safety` | PII detection, content moderation |
| **Usage Dashboard** | `/ai-kit/dashboard` | **Reference design for our analytics dashboard** |
| Video Recording | `/ai-kit/video` | Screen capture + Whisper transcription |
| A2UI Protocol | `/ai-kit/a2ui` | JSON-driven UI generation |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| AINative SDKs | `@ainative/next-sdk`, `@ainative/aikit-react` |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui |
| State Management | Zustand (for local studio state only) |
| Server State | `@ainative/react-sdk` hooks + TanStack Query v5 (for non-AINative data) |
| Forms | React Hook Form + Zod |
| Video Playback | Video.js |
| Drag & Drop | dnd-kit |
| Calendar | FullCalendar (React) |
| Charts | Recharts — **styled to match `/ai-kit/dashboard`** |
| File Upload | react-dropzone |
| Auth | `@ainative/next-sdk` (`withAuth` middleware + `getSession`) |
| Deployment | Railway (Dockerfile) |

---

## 4. Project Structure

```
ai-twin-content-studio/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Uses createServerClient for session check
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # AINativeProvider wraps all dashboard routes
│   │   ├── page.tsx                # Home — useCredits() balance widget
│   │   ├── calendar/page.tsx       # Content calendar
│   │   ├── scripts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx       # ScriptEditor — useChat() + StreamingMessage
│   │   ├── twins/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── studio/page.tsx         # useChat + useMemory + StreamingMessage
│   │   ├── bulk/page.tsx           # useTask() for batch job polling
│   │   ├── publish/page.tsx
│   │   ├── analytics/page.tsx      # Mirrors /ai-kit/dashboard design
│   │   └── settings/page.tsx       # useCredits() + useAgent()
│   ├── api/
│   │   ├── auth/route.ts           # createAgentWebhookHandler
│   │   └── webhooks/
│   │       ├── heygen/route.ts     # createAgentWebhookHandler for avatar completion
│   │       └── publishing/route.ts # Social platform delivery callbacks
│   ├── layout.tsx                  # Root — AINativeProvider, global styles
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── CreditsWidget.tsx       # useCredits() — live balance in nav
│   ├── calendar/
│   │   ├── ContentCalendar.tsx
│   │   ├── CalendarItem.tsx
│   │   └── ScheduleDrawer.tsx
│   ├── scripts/
│   │   ├── ScriptEditor.tsx        # <StreamingMessage> for AI output
│   │   ├── ScriptGenerator.tsx     # useChat({ model: 'claude-sonnet-4-6' })
│   │   └── ToneSelector.tsx
│   ├── twins/
│   │   ├── TwinCard.tsx
│   │   ├── TwinCreator.tsx
│   │   ├── StylePresetPicker.tsx
│   │   └── VoiceSelector.tsx
│   ├── studio/
│   │   ├── VideoUploader.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── CaptionEditor.tsx
│   │   ├── VoiceoverControls.tsx
│   │   └── RenderProgress.tsx      # useTask() job polling
│   ├── bulk/
│   │   ├── CSVImporter.tsx
│   │   ├── BatchJobCard.tsx
│   │   └── RenderQueue.tsx         # useTask() per-item status
│   ├── publish/
│   │   ├── PlatformConnector.tsx
│   │   ├── PublishScheduler.tsx
│   │   ├── PlatformPreview.tsx
│   │   └── PublishHistory.tsx
│   └── analytics/
│       ├── MetricsGrid.tsx         # Styled after /ai-kit/dashboard metrics grid
│       ├── EngagementChart.tsx     # Recharts — same palette as AI Kit dashboard
│       ├── TwinPerformanceTable.tsx
│       └── ExportButton.tsx
├── lib/
│   ├── ainative.ts                 # Re-export SDK hooks + createServerClient
│   ├── hooks/
│   │   ├── useScriptGenerator.ts   # Wraps useChat with script system prompt
│   │   ├── useTwins.ts             # REST calls to /twins CRUD
│   │   ├── useCalendar.ts          # REST calls to /content/calendar
│   │   ├── useVideoRender.ts       # Wraps useTask for avatar/render jobs
│   │   ├── useBulkJobs.ts          # Wraps useTask for bulk queues
│   │   ├── usePublishing.ts        # Social publishing REST calls
│   │   └── useAnalytics.ts         # Social analytics REST calls
│   ├── stores/
│   │   ├── studioStore.ts          # Local video editor state (Zustand)
│   │   └── bulkStore.ts            # Local bulk import state (Zustand)
│   └── utils/
│       ├── platformLimits.ts
│       └── creditEstimator.ts
├── middleware.ts                   # withAuth() — protects all /dashboard/* routes
├── types/
│   ├── twin.ts
│   ├── calendar.ts
│   ├── studio.ts
│   └── analytics.ts
├── public/style-presets/
├── Dockerfile
├── railway.toml
├── next.config.ts
└── package.json
```

---

## 5. SDK Integration Patterns

### 5.1 Root Layout — `AINativeProvider`

```tsx
// app/layout.tsx
import { AINativeProvider } from '@ainative/next-sdk/client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AINativeProvider config={{ apiKey: process.env.NEXT_PUBLIC_AINATIVE_API_KEY! }}>
          {children}
        </AINativeProvider>
      </body>
    </html>
  );
}
```

### 5.2 Middleware — `withAuth`

```ts
// middleware.ts
import { withAuth } from '@ainative/next-sdk/server';

export default withAuth;

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### 5.3 Script Generator — `useChat` + `StreamingMessage`

```tsx
// components/scripts/ScriptGenerator.tsx
'use client';
import { useChat } from '@ainative/next-sdk/client';
import { StreamingMessage, StreamingIndicator } from '@ainative/aikit-react';

export function ScriptGenerator({ topic, tone, duration, platform }) {
  const { messages, isLoading, error, sendMessage } = useChat({
    model: 'claude-sonnet-4-6',
  });

  const generate = () => sendMessage([{
    role: 'system',
    content: `You are a short-form content scriptwriter. Write a ${duration}s script on "${topic}" in a ${tone} tone optimized for ${platform}. Be punchy, hook in the first 3 words.`,
  }, {
    role: 'user',
    content: topic,
  }]);

  return (
    <div>
      {isLoading && <StreamingIndicator />}
      {messages.filter(m => m.role === 'assistant').map((m, i) => (
        <StreamingMessage key={i} content={m.content} />
      ))}
      {error && <p className="text-red-400">{error.message}</p>}
      <button onClick={generate}>Generate Script</button>
    </div>
  );
}
```

### 5.4 Credits Widget — `useCredits`

```tsx
// components/layout/CreditsWidget.tsx
'use client';
import { useCredits } from '@ainative/next-sdk/client';

export function CreditsWidget() {
  const { balance, isLoading } = useCredits();
  return (
    <div className="text-sm text-gray-400">
      {isLoading ? '...' : `${balance?.remaining_credits?.toLocaleString()} credits`}
    </div>
  );
}
```

### 5.5 Render Job Polling — `useTask`

```tsx
// components/studio/RenderProgress.tsx
'use client';
import { useTask } from '@ainative/next-sdk/client';

export function RenderProgress({ taskId }) {
  const { task, isLoading } = useTask(taskId, { pollInterval: 3000 });

  return (
    <div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 transition-all"
          style={{ width: `${task?.progress ?? 0}%` }}
        />
      </div>
      <p className="text-sm text-gray-400 mt-1">
        {task?.status === 'completed' ? 'Done!' : `${task?.status ?? 'Queued'}...`}
      </p>
    </div>
  );
}
```

### 5.6 Creator Memory — `useMemory`

```tsx
// lib/hooks/useScriptGenerator.ts — personalizes suggestions over time
import { useMemory } from '@ainative/next-sdk/client';

export function useScriptGenerator(creatorId: string) {
  const { remember, recall } = useMemory();

  async function generateWithMemory(topic: string) {
    // Recall past preferences
    const prefs = await recall(topic, { entity_id: creatorId, limit: 3 });
    const context = prefs.map(m => m.content).join('\n');

    // ... build prompt with context, call useChat ...

    // Remember this generation
    await remember(`Generated ${topic} script in ${tone} tone`, {
      entity_id: creatorId,
      tags: ['script', 'generation', platform],
    });
  }

  return { generateWithMemory };
}
```

### 5.7 Server Component — `createServerClient`

```tsx
// app/(dashboard)/page.tsx — Server Component
import { createServerClient, getApiKey } from '@ainative/next-sdk/server';

export default async function DashboardPage() {
  const apiKey = await getApiKey();
  const client = createServerClient({ apiKey });
  const balance = await client.credits.balance();

  return <DashboardClient initialBalance={balance} />;
}
```

### 5.8 Webhook Handler — `createAgentWebhookHandler`

```ts
// app/api/webhooks/heygen/route.ts
import { createAgentWebhookHandler } from '@ainative/next-sdk/server';

export const POST = createAgentWebhookHandler({
  secret: process.env.HEYGEN_WEBHOOK_SECRET!,
  onEvent: async (event) => {
    if (event.type === 'video.completed') {
      // Update bulk job item status in DB via AINative API
    }
  },
});
```

---

## 6. Analytics Dashboard — Mirror `/ai-kit/dashboard`

The analytics dashboard at `/analytics` must visually match the AI Kit usage dashboard at https://ainative.studio/ai-kit/dashboard.

**Design requirements:**
- Same dark `#0D1117` background
- Same metric card style: number + label + trend indicator
- Recharts `LineChart` with same color palette (`#4B6FED` primary, `#8A63F4` secondary)
- Same table styling for "Top Videos" / "Twin Performance" (mirrors the model performance table)
- Token/credit tracking section from the dashboard is repurposed to show: Views, Likes, Reach, Engagement Rate

**Source reference:** `/Users/aideveloper/core/AINative-website-nextjs/app/ai-kit/dashboard/page.tsx`

The `useCredits()` hook provides real-time credit data displayed in both the Sidebar (`CreditsWidget`) and the analytics page's "Platform Credits Remaining" card.

---

## 7. Feature Specifications

### 7.1 Content Calendar (`/calendar`)
- FullCalendar month/week/day view
- Drag-and-drop reschedule → `PATCH /content/calendar/{id}`
- Color-coded by platform
- "New Content" → `ScheduleDrawer` with `ScriptGenerator` (uses `useChat`)

**API:** `GET/POST/PATCH/DELETE /content/calendar`

### 7.2 Script Generator (`/scripts`)
- `useChat({ model: 'claude-sonnet-4-6' })` — streaming script generation
- `<StreamingMessage>` renders AI output with typewriter effect
- `<StreamingIndicator>` during generation
- Tone selector: educational / entertaining / inspirational / professional
- Duration slider: 15s / 30s / 60s
- `useMemory` personalizes suggestions from past creator behavior
- `useThread` saves conversation history per script for iterative editing

**Key components:** `ScriptGenerator`, `ToneSelector`, `ScriptEditor`

### 7.3 AI Twin Library (`/twins`)
- Grid of `TwinCard` components
- Multi-step wizard: name → style preset → voice → personality tags → preview
- Preview: `useTask` polls `POST /multimodal/avatar/generate` job
- `useAgent` registers each twin as a named agent in AINative's agent registry

### 7.4 Video Creation Studio (`/studio`)
- Split panel: script (read-only `<StreamingMessage>`) | video preview | controls
- TTS: `POST /multimodal/tts`
- Avatar generation: `POST /multimodal/avatar/generate` → `useTask` polls status
- Captions: `POST /captions/generate` (Whisper) → `CaptionEditor` timeline
- `<RenderProgress>` component uses `useTask(jobId, { pollInterval: 3000 })`

### 7.5 Bulk Reel Builder (`/bulk`)
- CSV upload → `POST /bulk/import-scripts` → returns `job_id`
- `useTask(jobId, { pollInterval: 5000 })` powers `<RenderQueue>`
- Per-item status table with retry buttons
- Download ZIP or "Publish All" when `task.status === 'completed'`

### 7.6 Publishing Dashboard (`/publish`)
- Platform OAuth connect → `GET /social/connect/{platform}`
- `<PlatformPreview>` shows Instagram Reels / TikTok / LinkedIn frame previews
- Publish history via `GET /publishing/history`
- `createAgentWebhookHandler` at `app/api/webhooks/publishing/route.ts` receives delivery confirmations

### 7.7 Analytics Dashboard (`/analytics`)
- **Visual design: mirrors https://ainative.studio/ai-kit/dashboard**
- Metrics grid: Views, Likes, Shares, Reach, Engagement Rate
- `EngagementChart` — Recharts `LineChart` with `#4B6FED` / `#8A63F4` palette
- `TwinPerformanceTable` — sortable by engagement
- `useCredits()` powers "Credits Remaining" card in sidebar and analytics header
- Export: `POST /analytics/social/export` → signed URL

### 7.8 Settings (`/settings`)
- `useCredits()` — billing + balance
- `useAgent()` — list registered twins as agents
- Connected platforms (same component as `/publish`)
- API key display via `createServerClient` (server component, never client-side)

---

## 8. Package Dependencies

```json
{
  "dependencies": {
    "@ainative/next-sdk": "^1.0.1",
    "@ainative/aikit-react": "^0.1.0",
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^4.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@fullcalendar/react": "^6.0.0",
    "@fullcalendar/daygrid": "^6.0.0",
    "@fullcalendar/interaction": "^6.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "recharts": "^2.0.0",
    "react-dropzone": "^14.0.0",
    "video.js": "^8.0.0"
  }
}
```

---

## 9. Auth Flow

```
User visits /dashboard/* 
  → middleware.ts: withAuth() checks session cookie
  → No session → redirect /login
  → Has session → passes through

Login page:
  → POST to AINative /auth/login
  → JWT stored as httpOnly cookie via Next.js

Server Components:
  → getApiKey() reads cookie
  → createServerClient({ apiKey }) makes authenticated calls
  → Props passed down to Client Components as initialData

Client Components:
  → AINativeProvider holds apiKey (from env or session)
  → useChat / useMemory / useTask / useCredits hit AINative API directly
```

---

## 10. Deployment

- **Dockerfile:** `node:20-alpine`, multi-stage Next.js standalone build
- **Railway:** `ai-twin-content-studio` service under AINative-Studio workspace
- **Domain:** `studio.ainative.studio`
- **Env vars:**
  ```
  AINATIVE_API_URL=https://api.ainative.studio/api/v1/public
  AINATIVE_API_KEY=<service key>
  NEXT_PUBLIC_AINATIVE_API_KEY=<public key>
  JWT_SECRET=<secret>
  HEYGEN_WEBHOOK_SECRET=<secret>
  NEXT_PUBLIC_APP_URL=https://studio.ainative.studio
  ```

---

## 11. MVP Scope & Priority

### MVP — Weeks 1–4 (existing AINative APIs only)
- [ ] Auth: `withAuth` middleware + `getSession` + `createServerClient`
- [ ] Script Generator: `useChat('claude-sonnet-4-6')` + `<StreamingMessage>` + `<StreamingIndicator>`
- [ ] Creator memory: `useMemory` remember/recall for personalized suggestions
- [ ] Conversation history: `useThread` for iterative script editing
- [ ] Credits widget: `useCredits()` in sidebar nav
- [ ] File upload: ZeroDB file API
- [ ] Content Calendar: CRUD + Celery scheduling (core#2608)
- [ ] Video Studio: TTS + Whisper captions (core#2610)
- [ ] Basic Twin Library: style-preset-only (no avatar gen yet)

### Phase 2 — Weeks 5–8
- [ ] Avatar generation: `useTask` polls `POST /multimodal/avatar/generate` (core#2615)
- [ ] Bulk reel builder: `useTask` for batch job polling (core#2609)
- [ ] Instagram + TikTok publishing + `createAgentWebhookHandler` (core#2612)

### Phase 3 — Weeks 9–12
- [ ] Analytics dashboard (mirroring `/ai-kit/dashboard`) (core#2614)
- [ ] LinkedIn + YouTube publishing (core#2613)
- [ ] `useAgent` twin registration in AINative agent registry
- [ ] PDF/CSV export

---

## 12. Success Metrics

| Metric | Target |
|---|---|
| Script generation to first token | < 500ms |
| Full video export end-to-end | < 5 min |
| Batch reel capability | 100+ reels/week |
| Time saved vs manual workflow | 75% reduction |
| Platform publish success rate | > 98% |
| P95 page load | < 2s |

---

## 13. Backend Issues (AINative-Studio/core)

| Issue | Feature | Depends On |
|---|---|---|
| [core#2608](https://github.com/AINative-Studio/core/issues/2608) | Content Calendar API | — |
| [core#2609](https://github.com/AINative-Studio/core/issues/2609) | Bulk Reel Queue | core#2615 |
| [core#2610](https://github.com/AINative-Studio/core/issues/2610) | Caption Generation + Burn-in | — |
| [core#2611](https://github.com/AINative-Studio/core/issues/2611) | AI Twin Library CRUD | — |
| [core#2612](https://github.com/AINative-Studio/core/issues/2612) | Instagram + TikTok Publishing | core#2611 |
| [core#2613](https://github.com/AINative-Studio/core/issues/2613) | LinkedIn + YouTube Publishing | core#2612 |
| [core#2614](https://github.com/AINative-Studio/core/issues/2614) | Social Analytics Aggregation | core#2612 |
| [core#2615](https://github.com/AINative-Studio/core/issues/2615) | Avatar API Wrapper (HeyGen/D-ID) | core#2611 |
