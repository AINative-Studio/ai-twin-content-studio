# Product Requirements Document (PRD)
## AI Twin Content Studio — Frontend

**Prepared By:** AINative Studio  
**Date:** April 29, 2026  
**Version:** 2.0 (Frontend Implementation)  
**Original PRD:** Alexandra Mitchelson, June 19, 2025 v1.0  
**Status:** Active Development  

---

## 1. Purpose

AI Twin Content Studio is a web application that centralizes the entire workflow of AI-powered short-form educational content creation. It replaces a fragmented stack (ChatGPT, CapCut, Snapchat, TikTok, Captions, etc.) with a single cohesive platform.

**All AI capabilities are powered by AINative APIs** — no OpenAI/ChatGPT dependency. The platform uses:
- `POST /api/v1/public/chat/completions` — script generation (Claude, MiniMax M2.7, NousCoder)
- `POST /api/v1/public/multimodal/tts` — voice synthesis (MiniMax TTS)
- `POST /api/v1/public/multimodal/video/t2v` + `i2v` — video generation (CogVideoX via RunPod)
- `POST /api/v1/public/multimodal/avatar/generate` — AI twin video (HeyGen/D-ID wrapper)
- `POST /api/v1/public/audio/transcribe` — Whisper transcription
- `POST /api/v1/public/embeddings/generate` — semantic embeddings (free)
- `POST /api/v1/public/memory/v2/remember` — creator preference memory
- ZeroDB file storage — video/image asset management

**API Base:** `https://api.ainative.studio/api/v1/public`  
**Auth:** Bearer token (JWT) or API key (`X-API-Key`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| State Management | Zustand |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Video Playback | Video.js |
| Drag & Drop | dnd-kit |
| Calendar | FullCalendar (React) |
| Charts / Analytics | Recharts |
| File Upload | react-dropzone |
| Auth | AINative JWT (cookie-based) |
| Deployment | Railway (Dockerfile, same org) |

---

## 3. Project Structure

```
ai-twin-content-studio/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + nav
│   │   ├── page.tsx                # Home dashboard
│   │   ├── calendar/page.tsx       # Content calendar
│   │   ├── scripts/
│   │   │   ├── page.tsx            # Script list
│   │   │   └── [id]/page.tsx       # Script editor
│   │   ├── twins/
│   │   │   ├── page.tsx            # Twin library
│   │   │   └── [id]/page.tsx       # Twin editor
│   │   ├── studio/page.tsx         # Video creation studio
│   │   ├── bulk/page.tsx           # Bulk reel builder
│   │   ├── publish/page.tsx        # Publishing dashboard
│   │   ├── analytics/page.tsx      # Analytics dashboard
│   │   └── settings/page.tsx       # Account + integrations
│   ├── api/                        # Next.js route handlers (proxy to AINative)
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── proxy/[...path]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileNav.tsx
│   ├── calendar/
│   │   ├── ContentCalendar.tsx     # FullCalendar wrapper
│   │   ├── CalendarItem.tsx
│   │   └── ScheduleDrawer.tsx
│   ├── scripts/
│   │   ├── ScriptEditor.tsx        # Rich text editor
│   │   ├── ScriptGenerator.tsx     # AI generation UI
│   │   └── ToneSelector.tsx
│   ├── twins/
│   │   ├── TwinCard.tsx
│   │   ├── TwinCreator.tsx         # Avatar builder
│   │   ├── StylePresetPicker.tsx   # goddess/futurist/etc.
│   │   └── VoiceSelector.tsx
│   ├── studio/
│   │   ├── VideoUploader.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── CaptionEditor.tsx       # SRT timing editor
│   │   ├── VoiceoverControls.tsx
│   │   └── RenderProgress.tsx
│   ├── bulk/
│   │   ├── CSVImporter.tsx
│   │   ├── BatchJobCard.tsx
│   │   └── RenderQueue.tsx
│   ├── publish/
│   │   ├── PlatformConnector.tsx   # OAuth connect UI
│   │   ├── PublishScheduler.tsx
│   │   ├── PlatformPreview.tsx     # Instagram/TikTok frame preview
│   │   └── PublishHistory.tsx
│   └── analytics/
│       ├── MetricsGrid.tsx
│       ├── EngagementChart.tsx
│       ├── TwinPerformanceTable.tsx
│       └── ExportButton.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts               # Typed AINative API client
│   │   ├── scripts.ts
│   │   ├── twins.ts
│   │   ├── calendar.ts
│   │   ├── studio.ts
│   │   ├── bulk.ts
│   │   ├── publishing.ts
│   │   └── analytics.ts
│   ├── hooks/
│   │   ├── useScriptGenerator.ts
│   │   ├── useTwins.ts
│   │   ├── useCalendar.ts
│   │   ├── useVideoRender.ts
│   │   ├── useBulkJobs.ts
│   │   ├── usePublishing.ts
│   │   └── useAnalytics.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── studioStore.ts
│   │   └── bulkStore.ts
│   └── utils/
│       ├── formatDuration.ts
│       ├── platformLimits.ts       # Per-platform video/caption specs
│       └── creditEstimator.ts
├── types/
│   ├── api.ts                      # Response types matching AINative OpenAPI
│   ├── twin.ts
│   ├── calendar.ts
│   ├── studio.ts
│   └── analytics.ts
├── public/
│   └── style-presets/              # Thumbnail images for style presets
├── Dockerfile
├── railway.toml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Feature Specifications

### 4.1 Content Calendar (`/calendar`)

**Purpose:** Visualize, schedule, and manage all upcoming content.

**UI:**
- Month/week/day view toggle (FullCalendar)
- Drag-and-drop to reschedule items
- Color-coded by platform (Instagram=pink, TikTok=red, YouTube=red-dark, LinkedIn=blue)
- Click item → slide-over drawer with script preview + publish status

**API calls:**
```
GET  /content/calendar?from=2026-04-01&to=2026-04-30
POST /content/calendar
PATCH /content/calendar/{id}
DELETE /content/calendar/{id}
```

**Component flow:**
1. `ContentCalendar` renders FullCalendar with events from `useCalendar()` hook
2. Drag-drop fires `PATCH /content/calendar/{id}` with new `scheduled_at`
3. "New Content" button opens `ScheduleDrawer` with `ScriptEditor` + twin selector

---

### 4.2 Script Generator (`/scripts`)

**Purpose:** AI-powered script creation with tone/style presets.

**UI:**
- Topic input + tone selector (educational, entertaining, inspirational, professional)
- Target duration slider (15s / 30s / 60s)
- Platform selector (affects script length and CTA style)
- "Generate" button → streams AI response character by character
- Editable output with word count + estimated read time
- "Save to Calendar" button

**API calls:**
```
POST /chat/completions
  body: {
    model: "claude-sonnet-4-6",
    messages: [{
      role: "system",
      content: "You are a short-form content scriptwriter. Write a {duration}s script on '{topic}' in a {tone} tone for {platform}."
    }, {
      role: "user", content: topic
    }],
    stream: true
  }
```

**Notes:**
- Streaming via SSE — show typewriter effect as script generates
- Script stored locally in Zustand `studioStore` until saved
- Memory: `POST /memory/v2/remember` stores user's preferred tone/topics for personalization

---

### 4.3 AI Twin Library (`/twins`)

**Purpose:** Create and manage multiple AI avatar personas.

**UI:**
- Grid of twin cards with thumbnail, name, style preset badge, and voice label
- "Create Twin" button → multi-step wizard:
  1. Name + style preset picker (goddess / futurist / celestial / corporate / minimalist / bold)
  2. Upload reference photo or video (for avatar model)
  3. Voice selector — pick from TTS voice library or record 30s sample for voice clone
  4. Personality/tone tags (friendly, authoritative, playful, calm)
  5. Preview: generate 5s sample clip
- Clone, edit, delete actions on each card

**API calls:**
```
GET    /twins
POST   /twins
PATCH  /twins/{id}
POST   /twins/{id}/clone
DELETE /twins/{id}
POST   /multimodal/tts           # voice preview
POST   /multimodal/avatar/generate  # sample clip generation
```

**Style preset thumbnails:** static images in `/public/style-presets/` showing visual reference for each preset.

---

### 4.4 Video Creation Studio (`/studio`)

**Purpose:** End-to-end video creation — upload or record, apply twin, add voiceover + captions, export.

**UI:** Split-panel layout
- **Left:** Script panel (ScriptEditor, read-only if imported from calendar)
- **Center:** Video preview canvas (VideoPreview with Video.js)
- **Right:** Controls panel
  - Twin selector (TwinCard carousel)
  - Voice controls (speed, pitch, preview)
  - Caption editor (timeline with draggable segments)
  - Export button + platform format selector

**Workflow:**
1. Upload video (`VideoUploader` → ZeroDB file API) or use t2v generation
2. Select twin → fires `POST /multimodal/avatar/generate`
3. TTS voiceover → `POST /multimodal/tts`
4. Auto-captions → `POST /captions/generate` (Whisper) → shows in `CaptionEditor`
5. Fine-tune caption timing in timeline editor
6. Burn-in captions → `POST /captions/{id}/burn-in`
7. Export to publish queue or download

**Render progress:** `RenderProgress` polls `GET /multimodal/avatar/status/{job_id}` every 3s, shows percent + ETA.

---

### 4.5 Bulk Reel Builder (`/bulk`)

**Purpose:** Generate hundreds of short reels from a CSV or content calendar selection.

**UI:**
- Two input modes:
  - "Upload CSV" — drag-drop CSV with columns: `prompt`, `twin_id`, `voice_id`, `platform`
  - "From Calendar" — multi-select calendar items for batch render
- Twin + voice override selectors (apply same to all if desired)
- "Start Batch" button → shows `RenderQueue` with per-item status cards
- Download ZIP or "Publish All" button when complete

**API calls:**
```
POST /bulk/import-scripts       # creates batch job, returns job_id
GET  /bulk/{job_id}/status      # poll every 5s
GET  /bulk/{job_id}/download    # once complete
```

**RenderQueue component:**
- Live-updating table: item #, prompt preview, status (queued/rendering/done/failed), ETA
- Failed items show error + "Retry" button
- WebSocket connection preferred if available, falls back to polling

---

### 4.6 Publishing Dashboard (`/publish`)

**Purpose:** Connect social accounts and schedule or instantly publish content.

**UI:**
- **Platform connections panel:** icons for Instagram, TikTok, LinkedIn, YouTube — green checkmark if connected, "Connect" button if not
- **Content queue:** list of scheduled items from calendar with publish datetime, platform, twin used, status
- **Platform preview:** toggle between Instagram Reels / TikTok / LinkedIn frame previews showing how the video will appear
- **Instant publish:** drag any completed video → "Publish Now" button per platform

**OAuth flow:**
```
GET /social/connect/{platform}    # redirects to platform OAuth
GET /social/callback/{platform}   # handled by backend, redirects back with success
GET /social/connections           # show which are connected
```

**Publish:**
```
POST /publishing/publish          # immediate
POST /publishing/schedule         # queued (Celery)
GET  /publishing/history          # past publishes with status
```

**Platform format specs** (enforced client-side in `platformLimits.ts`):
| Platform | Aspect | Max Duration | Max File Size | Caption Limit |
|---|---|---|---|---|
| Instagram Reels | 9:16 | 90s | 1GB | 2200 chars |
| TikTok | 9:16 | 60s | 287MB | 150 chars |
| LinkedIn | 1:1 or 16:9 | 10min | 5GB | 3000 chars |
| YouTube Shorts | 9:16 | 60s | 128GB | 5000 chars |

---

### 4.7 Analytics Dashboard (`/analytics`)

**Purpose:** Unified performance reporting across platforms and twin personas.

**UI:**
- Date range picker (last 7/30/90 days, custom)
- Filter by: platform, twin persona, topic tag
- Metrics grid: views, likes, shares, comments, reach, engagement rate
- Engagement chart (Recharts LineChart — by day/week)
- Twin performance table: rank each twin by total engagement
- Top videos table: sortable by views, likes, engagement
- Export button → PDF or CSV

**API calls:**
```
GET /analytics/social?platform=instagram&date_from=...&date_to=...&group_by=day
GET /analytics/social/summary
POST /analytics/social/export   # returns signed download URL
```

---

### 4.8 Settings (`/settings`)

- Profile (name, avatar, timezone)
- API key display (read-only, for direct API access)
- Connected platforms (same as publish panel)
- Billing / credits display (pull from AINative billing API)
- Notification preferences

---

## 5. AINative API Client (`lib/api/client.ts`)

Typed wrapper around all AINative endpoints. All requests go through this client — never raw fetch in components.

```typescript
const AINATIVE_BASE = process.env.NEXT_PUBLIC_AINATIVE_API_URL 
  ?? 'https://api.ainative.studio/api/v1/public';

export class AINativeClient {
  constructor(private apiKey: string) {}

  async chatCompletion(messages: Message[], model = 'claude-sonnet-4-6') { ... }
  async generateScript(topic: string, tone: string, duration: number, platform: string) { ... }
  async generateTTS(text: string, voiceId: string) { ... }
  async generateAvatar(twinId: string, script: string, voiceId: string) { ... }
  async pollAvatarStatus(jobId: string) { ... }
  async generateCaptions(audioUrl: string) { ... }
  async burnInCaptions(captionId: string) { ... }
  async uploadFile(file: File) { ... }
  async remember(agentId: string, content: string, tags: string[]) { ... }
  async recall(agentId: string, query: string) { ... }
  // ... full typed surface
}
```

---

## 6. Auth Flow

- Login via AINative JWT (`POST /auth/login`)
- Token stored in httpOnly cookie via Next.js middleware
- `middleware.ts` protects all `/dashboard/*` routes
- API proxy at `app/api/proxy/[...path]/route.ts` — injects auth header server-side so API key never exposed to client

---

## 7. Deployment

- **Dockerfile:** `node:20-alpine`, multi-stage Next.js build
- **Railway:** Deploy under AINative-Studio Railway workspace, `ai-twin-content-studio` service
- **Env vars:**
  - `AINATIVE_API_URL=https://api.ainative.studio/api/v1/public`
  - `AINATIVE_API_KEY=<service key>`
  - `NEXT_PUBLIC_AINATIVE_API_URL=https://api.ainative.studio/api/v1/public`
  - `JWT_SECRET=<secret>`
- **Domain:** `studio.ainative.studio` (Railway custom domain)

---

## 8. MVP Scope & Priority

### MVP (Weeks 1–4)
- [ ] Auth (login/signup via AINative JWT)
- [ ] Script Generator (chat completions, streaming, tone presets)
- [ ] Basic Twin Library (create/list/delete — no avatar generation yet, use style prompt only)
- [ ] Studio (TTS voiceover + Whisper captions + video upload/download)
- [ ] Content Calendar (CRUD + Celery scheduled publish)
- [ ] File storage (ZeroDB)

### Phase 2 (Weeks 5–8)
- [ ] Avatar generation (HeyGen/D-ID wrapper)
- [ ] Bulk reel builder (CSV → Celery fan-out)
- [ ] Instagram + TikTok OAuth + publishing

### Phase 3 (Weeks 9–12)
- [ ] Social analytics dashboard
- [ ] LinkedIn + YouTube publishing
- [ ] PDF/CSV report export
- [ ] Creator memory (personalized script suggestions via ZeroMemory)

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Script generation to video export | < 5 minutes end-to-end |
| Batch reel capability | 100+ reels/week |
| Time saved per content cycle | 75% reduction vs manual workflow |
| Platform publish success rate | > 98% |
| P95 page load time | < 2s |

---

## 10. Issue Tracker

All backend API gaps tracked in `AINative-Studio/core`:
- core#2608 — Content Calendar API
- core#2609 — Bulk Reel Queue
- core#2610 — Caption Generation + Burn-in
- core#2611 — AI Twin Library CRUD
- core#2612 — Instagram + TikTok Publishing
- core#2613 — LinkedIn + YouTube Publishing
- core#2614 — Social Analytics Aggregation
- core#2615 — Avatar API Wrapper (HeyGen/D-ID)
