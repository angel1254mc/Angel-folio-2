# Programmatic Demo Video Framework + Music Route Demo — Design

Date: 2026-04-18
Status: Approved (pending user review of spec)

## Summary

Build a reusable, code-driven framework for producing polished cinematic demo videos of site features, and use it to produce the first demo for the `/music` route. Videos render at 1920×1080, 60fps, ~45–60s, with a fake browser chrome on a dark background, animated cursor, click ripples, callout labels, smooth camera zooms, scene sequencing, and a fade-to-dark outro.

## Goals

- A framework in this repo that any future feature demo can reuse, with primitives designed to be extracted into a standalone package later.
- A specific deliverable: a ~55s demo of the Song of the Day calendar at `/music`.
- Deterministic output: the same command produces the same video.
- Output: 1920×1080 @ 60fps H.264 MP4.

## Non-goals

- Not a live screen-recording GUI. Not a replacement for Screen Studio / After Effects for one-off marketing clips.
- Not cross-platform in v1 — the recorder uses ffmpeg's `gdigrab` (Windows). macOS/Linux capture backends can be added later behind the same `record.mjs` interface.
- No programmatic voiceover / TTS / captions.

## Architectural approach: hybrid Playwright + Remotion

Remotion is the React-based video compositor. But Remotion's iframe-based rendering of a live site runs into frame-determinism problems when rendered in parallel workers, and Remotion cannot drive real clicks in a frame-synchronous way across parallel renders.

Instead we use a **hybrid** pipeline:

```
Playwright (drives a real Chromium session)
    │
    ▼
Real browser window at fixed rect
    │
    ▼
ffmpeg (gdigrab screen capture @ 60fps, -draw_mouse 0)
    │
    ▼
recordings/<demo>/capture.mp4  +  meta.json (target rects, t0Frame)
    │
    ▼
Remotion (<OffthreadVideo/> + overlays: chrome, cursor, ripples, callouts, zoom, outro)
    │
    ▼
out/<demo>.mp4  (1920×1080 @ 60fps)
```

**Why not Playwright's built-in video recording:** uses Chrome DevTools Protocol `Page.screencastFrame`, which is not frame-rate-locked — typically 15–30fps under load. ffmpeg + gdigrab captures the OS window at a true locked 60fps.

**Why not pure Remotion with an iframe:** Remotion renders frames in parallel across browser workers, each with a fresh iframe. Imperative state (clicks, audio playback) doesn't persist across workers. URL-driven state works but requires sprinkling demo-mode branches throughout the app. Hybrid avoids both problems — the recording is a real continuous browser session; Remotion only handles overlay/compositing.

**What Playwright handles (no app changes needed):**
- Hide real cursor: `page.addStyleTag({ content: '*, *::before, *::after { cursor: none !important; }' })`
- Bypass the easter-egg unlock: `page.addInitScript(() => localStorage.setItem('<key>', '1'))` — key derived by reading `useEasterEgg`'s implementation
- Mute audio: Chromium `--mute-audio` flag (Remotion plays its own audio track synced to the video)
- Stub `/api/music` with fixture data: `page.route('/api/music*', route => route.fulfill(...))`

**Only app-side change:** add `data-demo-target="<name>"` attributes to the calendar day cells and bottom player's key regions (artwork, title, controls). These serve as (a) stable Playwright selectors and (b) anchors whose on-screen bounding rects are written to `meta.json` so the cursor overlay knows where to move.

## Project structure

```
angel-folio-2/
├── src/
│   └── components/                       # add data-demo-target attrs to existing components
├── demos/                                 # NEW — isolated from main Next.js app
│   ├── package.json                      # remotion + playwright + ffmpeg-static
│   ├── remotion.config.ts
│   ├── tsconfig.json
│   ├── scripts/
│   │   ├── record.mjs                   # Playwright + ffmpeg orchestration
│   │   ├── render.mjs                   # remotion render wrapper
│   │   ├── build.mjs                    # record + render
│   │   └── detect-marker.mjs            # find t0Frame (first non-magenta frame)
│   ├── src/
│   │   ├── Root.tsx                     # registers all compositions
│   │   ├── framework/                    # GENERIC reusable primitives
│   │   │   ├── BrowserChrome.tsx
│   │   │   ├── SiteFootage.tsx         # <OffthreadVideo> + zoom/pan transform
│   │   │   ├── Cursor.tsx
│   │   │   ├── ClickRipple.tsx
│   │   │   ├── Callout.tsx
│   │   │   ├── Outro.tsx
│   │   │   ├── Scene.tsx
│   │   │   ├── timing.ts
│   │   │   ├── targets.ts                # meta.json loader + projectToCanvas()
│   │   │   └── types.ts                  # DemoScript, Scene, CursorWaypoint, ...
│   │   └── demos/
│   │       └── music/
│   │           ├── MusicDemo.tsx
│   │           ├── script.ts
│   │           ├── playwright.mjs
│   │           └── fixture.json         # /api/music response for the demo month
│   ├── recordings/                       # gitignored
│   │   └── music/
│   │       ├── capture.mp4
│   │       └── meta.json
│   ├── public/
│   │   └── audio/
│   │       └── music-demo-preview.mp3
│   └── out/                              # gitignored
│       └── music.mp4
└── .gitignore                            # adds demos/recordings, demos/out, demos/node_modules
```

`demos/` has its own `package.json` so Remotion + Playwright deps don't pollute the production Next.js bundle.

## Framework primitives

All primitives live in `demos/src/framework/`. Zero knowledge of any specific demo. All take props; no global state; no app-specific imports. This is the surface that gets extracted into a standalone package later.

### `<BrowserChrome>`
A fake browser window shell. Props:
- `url: string` — shown in the address bar
- `width: number`, `height: number` — rendered size
- `children: ReactNode` — the inner content (the video footage)

Renders: rounded corners, soft drop shadow, three traffic-light dots on the left, a centered address bar with a lock icon + URL, subtle dark-mode chrome.

### `<SiteFootage>`
Wraps Remotion's `<OffthreadVideo>` with a zoom/pan transform driven by the current frame. Props:
- `src: string` — path to `recordings/<demo>/capture.mp4`
- `startFrom: number` — frame offset (passed to `<OffthreadVideo>`); equals `meta.t0Frame`
- `camera: CameraKeyframe[]` — interpolated camera state
- `targets: TargetMap` — from `meta.json`; used to resolve `origin: 'target:<name>'`

Applies `transform: scale(<scale>)` with `transform-origin: <originX>% <originY>%` derived from interpolated keyframes.

### `<Cursor>`
SVG arrow cursor rendered in the composition's 1920×1080 pixel space. Props:
- `waypoints: CursorWaypoint[]`
- `targets: TargetMap`
- `camera: CameraState` (current, per frame — to account for zoom when mapping `target:<name>` → on-screen position)

Motion uses `spring({ stiffness: 80, damping: 14 })` by default so arrivals arc and settle. Never teleports between waypoints. Hides itself when waypoints array has no entry covering the current frame.

### `<ClickRipple>`
One-shot expanding ring + subtle white flash at a point. Props:
- `at: number`, `target: string`, `targets`, `camera`
- Duration: 18 frames (300ms @ 60fps)
- Renders `null` outside its active window

### `<Callout>`
Labeled pointer. Props:
- `at: number`, `until: number`, `target: string`, `label: string`, `side: 'top'|'right'|'bottom'|'left'`
- Enters with 12-frame slide+fade from `side`, holds, exits with 12-frame fade out
- Renders a rounded pill-shaped label plus an arrow line from label to target

### `<Scene>`
Thin wrapper over Remotion's `<Sequence>`. Props: `from`, `duration`, plus defaults for cross-fade transitions.

### `<Outro>`
Full-bleed dark panel with centered URL text. Props: `url`, `fadeInFrames` (default 30), `holdFrames`, `fadeOutFrames` (default 30).

### `timing.ts`
Exports `ease.inOutCubic`, `ease.outExpo`, `spring(config)`, `interpolateKeyframes(frame, keyframes, easing)`.

### `targets.ts`
Exports `loadMeta(metaPath): TargetMap`, `projectToCanvas(rect, camera, canvas): {x, y}`. The projection accounts for the current camera zoom/pan so `target:<name>` always resolves to the target's **current on-screen** position, not its original recorded position.

### `types.ts`
The `DemoScript` interface and all sub-types (`Scene`, `CameraKeyframe`, `CursorWaypoint`, etc.).

## Scene authoring model

Each demo is a single declarative data file (`demos/src/demos/<feature>/script.ts`) plus a Playwright scenario (`playwright.mjs`) and a composition (`<Feature>Demo.tsx`). The composition reads the script and maps entries to framework primitives — no imperative animation code in demo files.

Script shape:

```ts
export const script: DemoScript = {
  fps: 60,
  durationInFrames: 3300,
  recording: 'recordings/music/capture.mp4',
  meta: 'recordings/music/meta.json',
  chrome: { url: 'angel1254.com/music' },
  scenes: [
    { id, from, duration, camera?, cursor?, clicks?, callouts?, audio?, outro? },
    ...
  ],
};
```

Key rules:
- `from` is absolute composition frame; `at` inside a scene is relative to `from`.
- `origin` in camera keyframes is either `[x, y]` normalized (0–1) or a `'target:<name>'` string.
- `target` in cursor/click/callout is a `data-demo-target` name from `meta.json`.
- The composition file for each demo is ~30 lines and identical in shape across demos; only `script.ts` changes.

## Recording pipeline

`scripts/record.mjs` orchestrates:

1. **Ensure dev server** — detect `http://localhost:3000`; start `npm run dev` as a child process if absent; wait on port.
2. **Spawn ffmpeg capture:**
   ```
   ffmpeg -y -f gdigrab -framerate 60 -draw_mouse 0
          -offset_x 100 -offset_y 100 -video_size 1600x900
          -i desktop
          -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p
          recordings/music/capture.mp4
   ```
3. **Launch Chromium** via Playwright with `--app=data:text/html,<body style="background:magenta;margin:0"></body>`, `--window-position=100,100`, `--window-size=1600,900`, `--mute-audio`. Starts on full-bleed magenta (the sync marker).
4. **Wait 1s on magenta**, then `page.goto('http://localhost:3000/music')`. Inject:
   - cursor-hiding stylesheet via `page.addStyleTag`
   - easter-egg localStorage seed via `page.addInitScript`
   - `/api/music` interception with fixture JSON via `page.route`
5. **Probe target positions** — in-page script queries `document.querySelectorAll('[data-demo-target]')`, records each `getBoundingClientRect()` into `meta.json` together with `fps: 60`, `windowRect`.
6. **Run the demo's Playwright scenario** (`demos/music/playwright.mjs`). For music: wait 4s, click day-2026-04-15, wait 30s.
7. **Stop ffmpeg** (SIGINT); close Chromium.
8. **Detect t0Frame** (`scripts/detect-marker.mjs`) — sample the first ~3s of `capture.mp4`, find the first frame whose average color is not magenta; write `t0Frame` into `meta.json`.

## Render pipeline

`scripts/render.mjs` invokes Remotion:

```
npx remotion render src/Root.tsx MusicDemo out/music.mp4
    --props='{"demo":"music"}'
    --codec=h264 --crf=18 --concurrency=8
```

Remotion reads `demos/music/script.ts`, reads `recordings/music/meta.json`, composes `<SiteFootage startFrom={t0Frame}>` inside `<BrowserChrome>`, overlays all scene primitives, mixes scene-local `<Audio>` tracks, outputs `out/music.mp4`.

Composition is registered at 1920×1080 @ 60fps — non-negotiable per PRD.

## Commands

- `npm run demo:record -- music` — Phase 1–2 only (expensive, ~60s)
- `npm run demo:render -- music` — Phase 3 only (cheap, iterate on overlays)
- `npm run demo:build -- music` — all phases (fresh run)

## Music demo specifics

### Data setup

Demo uses a fixture response for `/api/music` for April 2026, with 30 entries (one per day). Each entry has `{ date, title, artist, album, artwork_url, track_url }`. Artwork URLs point to stable remote image URLs (the same source Deezer uses in real entries). The fixture is committed under `demos/src/demos/music/fixture.json`.

### App-side change (minimal)

Add `data-demo-target` attributes:
- `MusicCalendar` day cells: `data-demo-target="day-YYYY-MM-DD"` (one per cell)
- `BottomPlayer` regions: `data-demo-target="player"`, `data-demo-target="player-artwork"`, `data-demo-target="player-title"`, `data-demo-target="player-controls"`

### Scenes

Total 55s = 3300 frames @ 60fps.

**Scene 1 — Intro (0–5s, 300 frames).** Camera at 1.0× centered. Full calendar visible. No cursor. Deliberate stillness.

**Scene 2 — Pick a day (5–14s, 540 frames).** Cursor fades in off-frame right, arcs to day-2026-04-15. Camera eases from 1.0× to 1.3× centered on that cell over the last 6s. Cursor lands at ~t+6s, hovers 0.5s, clicks at ~t+6.5s. Click ripple fires. In the recorded footage, Playwright's real click opens the player.

**Scene 3 — Show the player (14–29s, 900 frames).** Camera continues 1.3× → 1.8× re-centered on bottom player over first 2s. **Audio: real 10s song preview begins at scene start at volume 0.9.** Callouts staggered: "Album art" (t+3s, side:left), "Song + artist" (t+4s, side:right), "Preview playback" (t+7s, side:top). Each holds ~4s. Final ~3s is the player alone with the song still playing.

**Scene 4 — Zoom back out (29–44s, 900 frames).** Camera 1.8× → 1.0× over 5s, holds 10s on full calendar. Cursor fades out during zoom. Audio fades out over last 2s of zoom.

**Scene 5 — Outro (44–55s, 660 frames).** Cross-dissolve to full-bleed dark panel. `angel1254.com/music` in light-weight type, centered. Fade in 0.5s, hold 10s, fade out 0.5s.

### Audio source

`demos/public/audio/music-demo-preview.mp3` — a 10-second clip sampled from the `track_url` of the day-2026-04-15 fixture song. Committed so renders are reproducible offline.

## Reusability checkpoint

To add a demo for a new route later:

1. `mkdir demos/src/demos/<feature>/` — add `<Feature>Demo.tsx` (copy music's, rename), `script.ts`, `playwright.mjs`, `fixture.json` if needed.
2. Register the new composition in `demos/src/Root.tsx`.
3. Add `data-demo-target` attributes to relevant existing components in `src/components/`.
4. `npm run demo:build -- <feature>`.

Nothing in `framework/` or `scripts/` changes.

## Extraction path (future)

When the framework is extracted to a standalone package (`@angel/demo-framework` or similar):

- `framework/` becomes the package source directly
- `scripts/record.mjs`, `scripts/render.mjs`, `scripts/build.mjs` become the package's CLI
- Per-site config: a `demo.config.ts` at a consuming repo's root declares dev-server command, window rect, and fixture/seed hooks
- Per-demo config stays identical: one folder with `Demo.tsx`, `script.ts`, `playwright.mjs`

No architectural changes required for that extraction — the split between `framework/` (generic) and `demos/<feature>/` (demo-specific) is already correct.

## Open items / assumptions

- **Easter-egg unlock mechanism.** Will inspect `src/components/hooks/useEasterEgg.js` during implementation to learn the localStorage key. If the unlock isn't localStorage-backed, a ~2-line change to accept a `?demo=1` bypass will be added, behind a strict gate so it has no effect in production.
- **Window rect geometry.** If 1600×900 at offset (100,100) doesn't fit well on the target display, the values in both ffmpeg args and Chromium flags are co-configured in one constants file; resize there.
- **ffmpeg binary.** Using `ffmpeg-static` for a vendored binary avoids relying on the user's PATH.
- **Node ESM.** `scripts/*.mjs` are ESM to use top-level await cleanly.

## Acceptance criteria

- [ ] `npm run demo:build -- music` produces `demos/out/music.mp4` with zero manual steps.
- [ ] Output is 1920×1080 @ 60fps, H.264, ~55 seconds.
- [ ] Browser chrome, cursor, ripples, callouts, zoom, audio, and outro all render correctly.
- [ ] Cursor motion uses springs; no teleports.
- [ ] Real song preview audio is audible during the player scene.
- [ ] Re-running `npm run demo:render -- music` without re-recording produces the same video.
- [ ] Adding a hypothetical `projects` demo requires no changes under `demos/src/framework/` or `demos/scripts/`.
