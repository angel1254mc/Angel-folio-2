# Music Demo Hybrid Reveal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing music demo with a three-beat reveal (M83 preview → Redbone preview → type "playmusic" → Rick Ross full track) and a horizontal-swap slide into a clean-brand outro, with Rick Ross audio continuing through the transition.

**Architecture:** Hardcoded scene timing in `script.ts` (same pattern as v1, no dynamic beat metadata). Two new framework primitives — `<KeycapStack>` for the typing overlay and `<BrandOutro>` for the slide+tagline. Playwright drops the sessionStorage easter-egg bypass and types the secret live; its waits are tuned to match `script.ts` frame positions. Three staged audio files in `demos/public/audio/` stacked as sequential `<Audio>` elements in the composition.

**Tech Stack:** Remotion, Playwright, ffmpeg, TypeScript.

**Parent spec:** [2026-04-19-music-demo-hybrid-reveal-design.md](../specs/2026-04-19-music-demo-hybrid-reveal-design.md)

---

## File structure

**Modified:**
- `demos/src/demos/music/fixture.json` — swap 4/19 entry
- `demos/src/framework/types.ts` — add `KeycapSpec`, `BrandOutroSpec`, extend `Scene`
- `demos/src/demos/music/playwright.mjs` — drop preseed, stub full-track, 3-beat flow
- `demos/src/demos/music/script.ts` — new scene structure
- `demos/src/demos/music/MusicDemo.tsx` — 3 audio sequences, adopt new primitives

**Created:**
- `demos/src/framework/KeycapStack.tsx`
- `demos/src/framework/BrandOutro.tsx`
- `demos/public/audio/music-demo-preview-01.mp3` (M83, ~2.5s)
- `demos/public/audio/music-demo-preview-02.mp3` (Redbone, ~2.5s)
- `demos/public/audio/music-demo-rick-ross.mp3` (~44s)

**Unchanged:**
- All other framework primitives, `record.mjs`, `render.mjs`, `detect-marker.mjs`, `loadMeta.ts`
- App-side code — `useEasterEgg.js`, `usePlaylist.js`, `CalendarCell.jsx` (aria-labels `Play preview` and `Play full track` already exist)

---

### Task 1: Swap the 4/19 fixture entry

**Files:**
- Modify: `demos/src/demos/music/fixture.json:21`

- [ ] **Step 1: Replace the 4/19 Ivy entry with Rick Ross**

In `demos/src/demos/music/fixture.json`, replace the entry that begins with `{ "date": "2026-04-19", "title": "Ivy", ...` with:

```json
    { "date": "2026-04-19", "title": "Live Fast, Die Young", "artist": "Rick Ross, Kanye West", "album": "Deeper Than Rap", "artwork_url": "https://e-cdns-images.dzcdn.net/images/cover/9db6a5b41e92e57f01bbb84fefc2321a/500x500.jpg", "track_url": "https://www.deezer.com/track/3135560", "deezer_id": 3135560 },
```

The `deezer_id` and `artwork_url` values are placeholders that must be replaced with the real Deezer IDs. Resolve them by opening `https://api.deezer.com/search?q=Live+Fast+Die+Young+Rick+Ross` in a browser, finding the canonical track, and copying its `id` and `md5_image` (the artwork URL pattern is `https://e-cdns-images.dzcdn.net/images/cover/<md5_image>/500x500.jpg`).

- [ ] **Step 2: Verify JSON still parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('demos/src/demos/music/fixture.json', 'utf8')); console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add demos/src/demos/music/fixture.json
git commit -m "feat(demos): swap 4/19 fixture entry to Rick Ross — Live Fast, Die Young"
```

---

### Task 2: Stage the three audio files

**Files:**
- Create: `demos/public/audio/music-demo-preview-01.mp3`
- Create: `demos/public/audio/music-demo-preview-02.mp3`
- Create: `demos/public/audio/music-demo-rick-ross.mp3`

- [ ] **Step 1: Fetch M83 30s preview and trim**

Look up Midnight City's Deezer ID (`10285662`) and fetch its preview URL:

```bash
curl -s https://api.deezer.com/track/10285662 | node -e "let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).preview))"
```

The returned URL is a 30s CDN MP3. Download and trim the first 2.5 seconds:

```bash
cd demos
PREVIEW_URL="<paste url from above>"
npx ffmpeg-static -y -i "$PREVIEW_URL" -t 2.5 -c copy public/audio/music-demo-preview-01.mp3
```

Expected: `public/audio/music-demo-preview-01.mp3` exists, ~40KB, plays a 2.5s clip of Midnight City.

- [ ] **Step 2: Fetch Redbone 30s preview and trim**

Redbone's Deezer ID is `137249224`:

```bash
cd demos
PREVIEW_URL=$(curl -s https://api.deezer.com/track/137249224 | node -e "let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).preview))")
npx ffmpeg-static -y -i "$PREVIEW_URL" -t 2.5 -c copy public/audio/music-demo-preview-02.mp3
```

- [ ] **Step 3: Fetch Rick Ross preview and trim**

Rick Ross "Live Fast, Die Young" Deezer ID — use the value from Task 1:

```bash
cd demos
DEEZER_ID=<id-from-task-1>
PREVIEW_URL=$(curl -s https://api.deezer.com/track/$DEEZER_ID | node -e "let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).preview))")
# Deezer previews are 30s — we need ~44s. Loop the preview twice with a short crossfade.
npx ffmpeg-static -y -i "$PREVIEW_URL" -t 29.5 public/audio/_rr-part1.mp3
npx ffmpeg-static -y -i "$PREVIEW_URL" -ss 2 -t 15 public/audio/_rr-part2.mp3
npx ffmpeg-static -y -i concat:public/audio/_rr-part1.mp3\|public/audio/_rr-part2.mp3 -acodec copy public/audio/music-demo-rick-ross.mp3
rm public/audio/_rr-part1.mp3 public/audio/_rr-part2.mp3
```

Expected: `public/audio/music-demo-rick-ross.mp3` exists, ~44s long. Verify:

```bash
npx ffmpeg-static -i demos/public/audio/music-demo-rick-ross.mp3 2>&1 | grep Duration
```

Expected output contains `Duration: 00:00:44` or close.

If the concat approach produces audible seam, instead use a single preview looped by ffmpeg's stream_loop filter:

```bash
npx ffmpeg-static -y -stream_loop 1 -i "$PREVIEW_URL" -t 44 public/audio/music-demo-rick-ross.mp3
```

- [ ] **Step 4: Commit**

```bash
git add demos/public/audio/music-demo-preview-01.mp3 demos/public/audio/music-demo-preview-02.mp3 demos/public/audio/music-demo-rick-ross.mp3
git commit -m "feat(demos): stage M83 + Redbone preview clips and Rick Ross 44s audio"
```

---

### Task 3: Extend framework types

**Files:**
- Modify: `demos/src/framework/types.ts`

- [ ] **Step 1: Add new spec interfaces after `OutroSpec`**

Append after the existing `OutroSpec` interface (after line 56), before the `Scene` interface:

```ts
export interface KeycapSpec {
   at: number;
   text: string;           // e.g. 'playmusic'
   perKeyFrames: number;   // 7 at 60fps for 120ms per-key
   position?: 'top-center' | 'bottom-center';
}

export interface BrandOutroSpec {
   at: number;              // frame (scene-relative) when slide starts
   slideFrames: number;     // 42 for ~700ms at 60fps
   holdFrames: number;      // 180 for 3s tagline hold
   fadeOutFrames: number;   // 36 for 600ms audio fade
   brand: string;           // 'AngelFolio'
   url: string;             // 'angellopez.dev'
}
```

- [ ] **Step 2: Extend the `Scene` interface**

Replace the current `Scene` interface with:

```ts
export interface Scene {
   id: string;
   from: number;
   duration: number;
   camera?: CameraKeyframe[];
   cursor?: CursorWaypoint[];
   clicks?: ClickSpec[];
   callouts?: CalloutSpec[];
   audio?: AudioSpec;
   audios?: AudioSpec[];    // multiple concurrent/sequential audio clips
   outro?: OutroSpec;
   keycap?: KeycapSpec;
   brandOutro?: BrandOutroSpec;
}
```

`audios` is added because the rick-ross scene needs to layer a single audio track, but the preview-sequence scene needs two staggered ones. Keeping `audio` for backward compat.

- [ ] **Step 3: Add `startAt` and `at` to `AudioSpec`**

Replace the existing `AudioSpec` interface with:

```ts
export interface AudioSpec {
   src: string;
   at?: number;             // scene-relative frame when this clip begins
   startAt?: number;        // offset into the media file to begin playback
   durationInFrames?: number;
   volume?: number;
   fadeInFrames?: number;
   fadeOutFrames?: number;
}
```

- [ ] **Step 4: Verify TypeScript still compiles**

Run: `cd demos && npx tsc --noEmit`
Expected: no errors (other files still compile because new fields are optional).

- [ ] **Step 5: Commit**

```bash
git add demos/src/framework/types.ts
git commit -m "feat(demos): extend types for KeycapSpec, BrandOutroSpec, staggered audios"
```

---

### Task 4: Create `<KeycapStack>` primitive

**Files:**
- Create: `demos/src/framework/KeycapStack.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface Props {
   at: number;              // scene-relative frame when first key appears
   text: string;
   perKeyFrames: number;    // frames between each keycap lighting up
   position?: 'top-center' | 'bottom-center';
   sceneFrom: number;       // absolute scene start, so useCurrentFrame can be normalized
}

const LIT_FADE = 8;           // frames to animate dim → lit
const TAIL_HOLD = 30;         // frames the full word holds after last key
const TAIL_FADE = 24;         // frames to fade the whole row out

export const KeycapStack: React.FC<Props> = ({
   at,
   text,
   perKeyFrames,
   position = 'top-center',
   sceneFrom,
}) => {
   const frame = useCurrentFrame() - sceneFrom - at;
   const lastKeyFrame = perKeyFrames * (text.length - 1) + LIT_FADE;
   const fadeStart = lastKeyFrame + TAIL_HOLD;
   const fadeEnd = fadeStart + TAIL_FADE;

   if (frame < -2 || frame > fadeEnd + 2) return null;

   const rowOpacity = frame < fadeStart
      ? 1
      : interpolate(frame, [fadeStart, fadeEnd], [1, 0], {
           extrapolateLeft: 'clamp',
           extrapolateRight: 'clamp',
        });

   return (
      <AbsoluteFill
         style={{
            pointerEvents: 'none',
            display: 'flex',
            alignItems: position === 'top-center' ? 'flex-start' : 'flex-end',
            justifyContent: 'center',
            paddingTop: position === 'top-center' ? 80 : 0,
            paddingBottom: position === 'bottom-center' ? 80 : 0,
            opacity: rowOpacity,
         }}
      >
         <div style={{ display: 'flex', gap: 8 }}>
            {text.split('').map((ch, i) => {
               const keyStart = i * perKeyFrames;
               const lit = interpolate(
                  frame,
                  [keyStart, keyStart + LIT_FADE],
                  [0.18, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
               );
               const scale = interpolate(
                  frame,
                  [keyStart, keyStart + 3, keyStart + LIT_FADE],
                  [1, 1.06, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
               );
               return (
                  <div
                     key={i}
                     style={{
                        width: 64,
                        height: 72,
                        borderRadius: 12,
                        background:
                           'linear-gradient(180deg, #2b2b33 0%, #1a1a20 100%)',
                        boxShadow:
                           '0 3px 0 #000, 0 8px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                        color: '#f5f5f7',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontWeight: 600,
                        fontSize: 28,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: lit,
                        transform: `scale(${scale})`,
                     }}
                  >
                     {ch}
                  </div>
               );
            })}
         </div>
      </AbsoluteFill>
   );
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd demos && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/src/framework/KeycapStack.tsx
git commit -m "feat(demos): KeycapStack primitive for animated keyboard overlay"
```

---

### Task 5: Create `<BrandOutro>` primitive

**Files:**
- Create: `demos/src/framework/BrandOutro.tsx`

- [ ] **Step 1: Write the component**

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

interface Props {
   at: number;
   slideFrames: number;
   holdFrames: number;
   brand: string;
   url: string;
   sceneFrom: number;
   siteLayer: React.ReactNode;
}

const EASE = Easing.bezier(0.7, 0, 0.3, 1);

export const BrandOutro: React.FC<Props> = ({
   at,
   slideFrames,
   holdFrames,
   brand,
   url,
   sceneFrom,
   siteLayer,
}) => {
   const frame = useCurrentFrame() - sceneFrom - at;
   const total = slideFrames + holdFrames;
   if (frame < 0) {
      // Before the slide begins: render the site layer in place, no overlay.
      return <>{siteLayer}</>;
   }
   if (frame > total + 60) return null;

   const sitePercent = interpolate(frame, [0, slideFrames], [0, -100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE,
   });
   const taglinePercent = interpolate(frame, [0, slideFrames], [100, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE,
   });

   return (
      <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
         <div
            style={{
               position: 'absolute',
               inset: 0,
               transform: `translateX(${sitePercent}%)`,
               willChange: 'transform',
            }}
         >
            {siteLayer}
         </div>
         <div
            style={{
               position: 'absolute',
               inset: 0,
               transform: `translateX(${taglinePercent}%)`,
               background: '#000',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#fff',
               fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
               willChange: 'transform',
            }}
         >
            <div
               style={{
                  fontSize: 92,
                  fontWeight: 700,
                  letterSpacing: -2,
                  lineHeight: 1,
               }}
            >
               {brand}
            </div>
            <div
               style={{
                  fontSize: 18,
                  fontWeight: 400,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#9a9aa8',
                  marginTop: 28,
               }}
            >
               {url}
            </div>
         </div>
      </AbsoluteFill>
   );
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd demos && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/src/framework/BrandOutro.tsx
git commit -m "feat(demos): BrandOutro primitive — horizontal-swap slide with tagline"
```

---

### Task 6: Rewrite the Playwright scenario

**Files:**
- Modify: `demos/src/demos/music/playwright.mjs`

- [ ] **Step 1: Replace setup() — drop the sessionStorage preseed, stub full-track**

Replace the existing `setup` function (lines 14-45) with:

```js
export async function setup(page) {
   const fixture = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8')
   );

   // Intercept /api/music (fixture list). Keep the exact match so
   // /api/music/full-track doesn't get caught by this handler.
   await page.route('**/api/music', (route) =>
      route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(fixture),
      })
   );
   // Some builds include the month query param — match both.
   await page.route(/\/api\/music(\?.*)?$/, (route) =>
      route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(fixture),
      })
   );

   // Stub /api/music/full-track — usePlaylist fetches this when unlocked.
   // Return a local demo audio file so Rick Ross playback is deterministic.
   await page.route('**/api/music/full-track**', (route) =>
      route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify({
            url: '/api/demo-audio/rick-ross',
         }),
      })
   );
   // And serve the local file from a route inside the page origin.
   await page.route('**/api/demo-audio/rick-ross', (route) => {
      const audioPath = path.join(
         __dirname,
         '..',
         '..',
         '..',
         'public',
         'audio',
         'music-demo-rick-ross.mp3'
      );
      const body = fs.readFileSync(audioPath);
      route.fulfill({
         status: 200,
         contentType: 'audio/mpeg',
         body,
      });
   });

   // Hide real cursor + disable smooth scroll (no sessionStorage preseed — the
   // easter egg is typed live during the scenario).
   await page.addInitScript(() => {
      const inject = () => {
         const style = document.createElement('style');
         style.textContent =
            '*, *::before, *::after { cursor: none !important; } html { scroll-behavior: auto !important; }';
         document.documentElement.appendChild(style);
      };
      if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', inject);
      } else {
         inject();
      }
   });
}
```

- [ ] **Step 2: Replace scenario() with the three-beat flow**

Replace the existing `scenario` function (lines 63-84) with:

```js
export async function scenario(page) {
   await page.waitForSelector('[data-demo-target="day-2026-04-15"]', {
      timeout: 15000,
   });

   // Scene 1 (intro) — 5s still on the calendar
   await page.waitForTimeout(5000);

   // Scene 2 — Preview 1 (M83 on 4/15)
   // Cursor overlay is already arcing toward 4/15 in Remotion-land.
   // Hover + click the "Play preview" button at about t=+500ms into scene 2.
   await page.hover('[data-demo-target="day-2026-04-15"]', { force: true });
   await page.waitForTimeout(500);
   const preview1 = page.locator(
      '[data-demo-target="day-2026-04-15"] button[aria-label="Play preview"]'
   );
   await preview1.click({ force: true });

   // Let M83 preview play ~2s
   await page.waitForTimeout(2000);

   // Scene 2 continued — Preview 2 (Redbone on 4/03)
   await page.hover('[data-demo-target="day-2026-04-03"]', { force: true });
   await page.waitForTimeout(200);
   const preview2 = page.locator(
      '[data-demo-target="day-2026-04-03"] button[aria-label="Play preview"]'
   );
   await preview2.click({ force: true });

   // Let Redbone preview play ~2s
   await page.waitForTimeout(2000);

   // Scene 3 — Type the easter-egg word "playmusic" (per-key 120ms)
   // useEasterEgg's handler listens on document; focus any body element first.
   await page.evaluate(() => document.body.focus());
   await page.keyboard.type('playmusic', { delay: 120 });

   // Small pause so the unlock state propagates through React
   await page.waitForTimeout(500);

   // Scene 4 — Rick Ross full track (4/19)
   // After unlock, CalendarCell renders "Play full track" button instead of
   // the preview button. Wait for it, then click.
   await page.waitForSelector(
      '[data-demo-target="day-2026-04-19"] button[aria-label="Play full track"]',
      { timeout: 5000 }
   );
   await page.hover('[data-demo-target="day-2026-04-19"]', { force: true });
   await page.waitForTimeout(200);
   const rickRoss = page.locator(
      '[data-demo-target="day-2026-04-19"] button[aria-label="Play full track"]'
   );
   await rickRoss.click({ force: true });

   // Scenes 4+5 — let Rick Ross play through the slide + tagline (~44s)
   await page.waitForTimeout(44000);
}
```

- [ ] **Step 3: Run the recorder dry to verify the scenario runs without errors**

From the repo root:
```bash
cd demos
npm run record -- music
```

Expected:
- Dev server starts (or is detected)
- Chromium opens, site loads
- 5s still, then cursor hovers 4/15, click, ~2s, cursor hovers 4/03, click, ~2s
- Letters "playmusic" are typed visibly in the URL-less body (no UI feedback from the hook)
- After unlock, 4/19 cell rerenders with "Play full track" button
- Click lands, Rick Ross plays for 44s
- ffmpeg stops cleanly

Check `demos/recordings/music/capture.mp4` exists. Open in a media player — the sequence should visually match the above (audio from the real site is muted; captured video is silent).

- [ ] **Step 4: Commit**

```bash
git add demos/src/demos/music/playwright.mjs
git commit -m "feat(demos): 3-beat music scenario — preview M83, preview Redbone, type playmusic, play Rick Ross"
```

---

### Task 7: Rewrite `script.ts` with the new scene structure

**Files:**
- Modify: `demos/src/demos/music/script.ts`

- [ ] **Step 1: Replace the entire script with the new structure**

Replace the file contents with:

```ts
import { DemoScript } from '../../framework/types';

export const script: DemoScript = {
   fps: 60,
   durationInFrames: 3522,
   width: 1920,
   height: 1080,
   recording: 'recordings/music/capture.mp4',
   meta: 'recordings/music/meta.json',
   chrome: { url: 'angel1254.com/music' },
   scenes: [
      // Scene 1 — calendar hold (5s)
      {
         id: 'intro',
         from: 0,
         duration: 300,
         camera: [{ at: 0, scale: 1.0, origin: [0.5, 0.45] }],
      },

      // Scene 2 — preview sequence: M83, then Redbone (6.4s)
      // Playwright: hover 4/15 at ~+0, click at ~+30 (500ms), wait 2s, hover 4/03, click at ~+162 (2.7s), wait 2s
      {
         id: 'preview-sequence',
         from: 300,
         duration: 384,
         camera: [
            { at: 0, scale: 1.0, origin: [0.5, 0.45] },
            { at: 120, scale: 1.15, origin: 'target:day-2026-04-15' },
            { at: 180, scale: 1.15, origin: 'target:day-2026-04-15' },
            { at: 240, scale: 1.15, origin: 'target:day-2026-04-03' },
         ],
         cursor: [
            { at: 0, anchor: 'offscreen-right' },
            { at: 20, position: [1450, 380] },
            { at: 28, target: 'day-2026-04-15' },
            { at: 160, target: 'day-2026-04-03' },
         ],
         clicks: [
            { at: 30, target: 'day-2026-04-15' },
            { at: 162, target: 'day-2026-04-03' },
         ],
         audios: [
            {
               src: '/audio/music-demo-preview-01.mp3',
               at: 30,
               volume: 0.9,
               fadeInFrames: 6,
               fadeOutFrames: 24,
               durationInFrames: 150,
            },
            {
               src: '/audio/music-demo-preview-02.mp3',
               at: 162,
               volume: 0.9,
               fadeInFrames: 6,
               fadeOutFrames: 24,
               durationInFrames: 150,
            },
         ],
      },

      // Scene 3 — typing 'playmusic' (~2s)
      // 9 letters × 7 frames per-key = 63 frames; plus hold + pause
      {
         id: 'typing-beat',
         from: 684,
         duration: 216,
         camera: [
            { at: 0, scale: 1.15, origin: 'target:day-2026-04-03' },
            { at: 120, scale: 1.0, origin: [0.5, 0.45] },
         ],
         cursor: [{ at: 0, target: 'day-2026-04-03' }],
         keycap: {
            at: 0,
            text: 'playmusic',
            perKeyFrames: 7,
            position: 'top-center',
         },
      },

      // Scene 4 — Rick Ross on 4/19 (40s)
      // Playwright: after ~500ms post-unlock, hover 4/19, click at ~+16. Full track begins.
      {
         id: 'rick-ross',
         from: 900,
         duration: 2400,
         camera: [
            { at: 0, scale: 1.0, origin: [0.5, 0.45] },
            { at: 30, scale: 1.15, origin: 'target:day-2026-04-19' },
            { at: 180, scale: 1.4, origin: 'target:player' },
         ],
         cursor: [
            { at: 0, position: [960, 400] },
            { at: 14, target: 'day-2026-04-19' },
            { at: 90, anchor: 'fade-out' },
         ],
         clicks: [{ at: 16, target: 'day-2026-04-19' }],
         audios: [
            {
               src: '/audio/music-demo-rick-ross.mp3',
               at: 16,
               volume: 0.85,
               fadeInFrames: 12,
               durationInFrames: 2600,
            },
         ],
      },

      // Scene 5 — slide outro (3.7s)
      {
         id: 'slide-outro',
         from: 3300,
         duration: 222,
         brandOutro: {
            at: 0,
            slideFrames: 42,
            holdFrames: 180,
            fadeOutFrames: 36,
            brand: 'AngelFolio',
            url: 'angellopez.dev',
         },
      },
   ],
};
```

- [ ] **Step 2: Verify compiles**

Run: `cd demos && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demos/src/demos/music/script.ts
git commit -m "feat(demos): new 5-scene structure — intro, preview-sequence, typing, rick-ross, slide-outro"
```

---

### Task 8: Update `MusicDemo.tsx` to render new primitives

**Files:**
- Modify: `demos/src/demos/music/MusicDemo.tsx`

- [ ] **Step 1: Add new imports**

At the top of the file, update the import block:

```tsx
import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { script } from './script';
import { musicMeta } from './loadMeta';
import { BrowserChrome } from '../../framework/BrowserChrome';
import { SiteFootage } from '../../framework/SiteFootage';
import { Cursor } from '../../framework/Cursor';
import { ClickRipple } from '../../framework/ClickRipple';
import { Callout } from '../../framework/Callout';
import { Outro } from '../../framework/Outro';
import { KeycapStack } from '../../framework/KeycapStack';
import { BrandOutro } from '../../framework/BrandOutro';
import { resolveCameraAt } from '../../framework/targets';
import type { Scene, AudioSpec } from '../../framework/types';
```

- [ ] **Step 2: Restructure the component to wrap in `<BrandOutro>`**

Replace the entire `MusicDemo` component (not the helpers) with:

```tsx
export const MusicDemo: React.FC = () => {
   const frame = useCurrentFrame();
   const scene = findCurrentScene(frame);

   const camera = scene
      ? resolveCameraAt(frame - scene.from, scene.camera, musicMeta)
      : { scale: 1, originX: 0.5, originY: 0.5 };

   const outroScene = script.scenes.find((s) => s.brandOutro);

   const siteLayer = (
      <>
         <BrowserChrome
            url={script.chrome.url}
            x={FOOTAGE_X}
            y={FOOTAGE_Y}
            width={FOOTAGE_W}
            height={FOOTAGE_H}
         >
            <SiteFootage
               src={staticFile('recordings/music/capture.mp4')}
               startFrom={musicMeta.t0Frame}
               camera={camera}
               width={FOOTAGE_W}
               height={FOOTAGE_H - CHROME_BAR}
            />
         </BrowserChrome>

         {script.scenes
            .filter((s) => !s.brandOutro)
            .map((s) => (
               <Sequence
                  key={s.id}
                  from={s.from}
                  durationInFrames={s.duration}
               >
                  <SceneOverlays scene={s} camera={camera} />
               </Sequence>
            ))}
      </>
   );

   return (
      <AbsoluteFill style={{ background: '#0a0a0c' }}>
         {outroScene?.brandOutro ? (
            <Sequence
               from={outroScene.from}
               durationInFrames={outroScene.duration}
            >
               <BrandOutro
                  at={outroScene.brandOutro.at}
                  slideFrames={outroScene.brandOutro.slideFrames}
                  holdFrames={outroScene.brandOutro.holdFrames}
                  brand={outroScene.brandOutro.brand}
                  url={outroScene.brandOutro.url}
                  sceneFrom={outroScene.from}
                  siteLayer={siteLayer}
               />
            </Sequence>
         ) : null}
         {outroScene ? (
            // Before the outro scene begins, render the site layer directly.
            // BrandOutro also renders it (pre-slide), but duplicating is safer
            // than conditionally unmounting during the Sequence gap.
            <Sequence from={0} durationInFrames={outroScene.from}>
               {siteLayer}
            </Sequence>
         ) : (
            siteLayer
         )}
      </AbsoluteFill>
   );
};
```

- [ ] **Step 3: Extend `SceneOverlays` to support `audios` array and `keycap`**

Replace the existing `SceneOverlays` component with:

```tsx
const SceneOverlays: React.FC<{
   scene: Scene;
   camera: { scale: number; originX: number; originY: number };
}> = ({ scene, camera }) => {
   return (
      <>
         {scene.cursor && (
            <Cursor
               waypoints={scene.cursor}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
               canvas={{ w: 1920, h: 1080 }}
            />
         )}
         {scene.clicks?.map((c) => (
            <ClickRipple
               key={`${scene.id}-${c.at}`}
               at={c.at}
               target={c.target}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
            />
         ))}
         {scene.callouts?.map((c) => (
            <Callout
               key={`${scene.id}-${c.label}`}
               at={c.at}
               until={c.until}
               target={c.target}
               label={c.label}
               side={c.side}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
            />
         ))}
         {scene.audio && <ScheduledAudio spec={scene.audio} sceneFrom={scene.from} />}
         {scene.audios?.map((a, i) => (
            <ScheduledAudio key={`${scene.id}-audio-${i}`} spec={a} sceneFrom={scene.from} />
         ))}
         {scene.keycap && (
            <KeycapStack
               at={scene.keycap.at}
               text={scene.keycap.text}
               perKeyFrames={scene.keycap.perKeyFrames}
               position={scene.keycap.position}
               sceneFrom={scene.from}
            />
         )}
         {scene.outro && <Outro {...scene.outro} sceneFrom={scene.from} />}
      </>
   );
};

const ScheduledAudio: React.FC<{ spec: AudioSpec; sceneFrom: number }> = ({
   spec,
   sceneFrom,
}) => {
   const at = spec.at ?? 0;
   const dur = spec.durationInFrames;
   const frame = useCurrentFrame() - sceneFrom;
   const inWindow = frame >= at && (dur == null || frame < at + dur);

   const relative = frame - at;
   const fadeIn = spec.fadeInFrames ?? 0;
   const fadeOut = spec.fadeOutFrames ?? 0;
   const base = spec.volume ?? 1;

   let vol = base;
   if (fadeIn > 0 && relative < fadeIn) {
      vol = base * (relative / fadeIn);
   }
   if (dur != null && fadeOut > 0 && relative > dur - fadeOut) {
      vol = base * Math.max(0, (dur - relative) / fadeOut);
   }

   if (!inWindow) return null;
   return (
      <Sequence from={at} durationInFrames={dur ?? 999999}>
         <Audio src={staticFile(spec.src.replace(/^\//, ''))} volume={vol} />
      </Sequence>
   );
};
```

- [ ] **Step 4: Verify compiles**

Run: `cd demos && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add demos/src/demos/music/MusicDemo.tsx
git commit -m "feat(demos): MusicDemo composes KeycapStack + BrandOutro, supports audios[]"
```

---

### Task 9: End-to-end run and visual QA

**Files:** none (execution + tuning)

- [ ] **Step 1: Verify Remotion studio bundles**

Run: `cd demos && npx remotion studio src/index.ts`
Expected: Studio opens. `MusicDemo` composition shows 3522 frames in timeline. Preview may be black/stubbed (no `capture.mp4` yet) but doesn't error. Ctrl+C to exit.

- [ ] **Step 2: Run the recorder**

Run: `cd demos && npm run record -- music`
Expected: Chromium opens on magenta, loads /music, walks the 3-beat sequence, types `playmusic`, plays Rick Ross 44s. `capture.mp4` and `meta.json` are written.

Troubleshooting:
- If `Play preview` button doesn't appear on hover, verify the fixture's `preview_url` field on M83 and Redbone entries resolves — the app omits the preview button when `preview_url` is empty. Current fixture doesn't have `preview_url` per-entry; the site resolves previews from `deezer_id`. If the button is missing, `fullPlayMode` may be true by default — check `MusicPageClient.jsx` wiring and confirm the `unlocked` state flips only after keydown.
- If `playmusic` typing doesn't unlock: the `useEasterEgg` handler calls `e.key.length !== 1` — ensure `page.keyboard.type` sends single character keys, not composed keydowns. Playwright's `type()` does this correctly.
- If the Rick Ross full-track fetch fails: inspect network tab during recording (rerun with `headless: false` — it already is) and confirm `/api/music/full-track*` resolves via the stub.

- [ ] **Step 3: Run the renderer**

Run: `cd demos && npm run render -- music`
Expected: Remotion bundles, renders 3522 frames, outputs `demos/out/music.mp4`.

Verify:
```bash
npx ffmpeg-static -i demos/out/music.mp4 2>&1 | grep -E "(Duration|Stream)"
```
Expected: `Duration 00:00:58.7`, `Video: h264, 1920x1080, 60 fps`, `Audio: aac`.

- [ ] **Step 4: Visual QA checklist**

Open `demos/out/music.mp4` in a media player and verify in order:

1. **0–5s** — full April 2026 calendar, no movement, no cursor.
2. **5–7s** — cursor arcs in from the right, lands on 4/15 Midnight City cell, ripple fires, M83 preview clip audible.
3. **7–9s** — cursor arcs up to 4/03 Redbone, ripple, Redbone clip audible (M83 faded out).
4. **9–11.4s** — "playmusic" keycaps appear top-center, one per keystroke, cursor is stationary. Last key, row fades out.
5. **11.4–15s** — cursor arcs down-right to 4/19 Rick Ross, ripple fires, bottom player appears, camera zooms to player.
6. **15–55s** — Rick Ross plays. Player is on-screen, camera is held. No callouts (per spec).
7. **55–55.7s** — page slides left, black-tagline slides in from right, they cross at midline. Music continues.
8. **55.7–58.1s** — "AngelFolio" / "angellopez.dev" tagline visible, music playing.
9. **58.1–58.7s** — audio fades out over 600ms as video ends.

- [ ] **Step 5: Common tuning**

Issues and fixes:
- **Cursor lands off the calendar cell:** the `day-2026-04-15` target rect may not have been measured. Verify `meta.json` has entries for all used `day-*` keys. If not, the cell isn't rendered at measurement time — add a `waitForSelector` earlier in `setup()` or extend `record.mjs`'s `playerMeasureTimer` pattern to measure calendar cells after a longer wait.
- **Preview audio silent or misaligned:** open `MusicDemo.tsx`, confirm `ScheduledAudio` is actually mounting by adding `console.log` inside it temporarily. Check the `at` frame against scenario timing: preview 1 click happens at real-time 5.5s, scene 2 begins at frame 300 (5.0s), so the audio's `at: 30` (0.5s into scene = video frame 330 = 5.5s) should align.
- **Typing keycaps out of sync with the on-screen "effect":** the easter-egg hook is silent — there IS no on-screen effect to sync against. The keycap overlay is the only visible feedback. Keep `perKeyFrames: 7` to match the Playwright `delay: 120`.
- **Rick Ross audio cuts off early:** increase `durationInFrames` on the audio spec in Scene 4 (`rick-ross`). The 44s file should cover through the end of the outro — confirm with `ffmpeg -i demos/public/audio/music-demo-rick-ross.mp3` that duration is ≥43.7s.
- **Slide shows blank site during transition:** `BrandOutro` receives `siteLayer` as a prop. If the site shows black during slide, the `<Sequence>` wrapping siteLayer (before outro) may be ending one frame early — verify `durationInFrames={outroScene.from}` matches exactly.

Re-render after any tweak with `npm run render -- music` (no re-recording needed for Remotion-side tweaks).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore(demos): final music demo tuning for hybrid reveal"
```

---

## Self-review

**Spec coverage check (against 2026-04-19-music-demo-hybrid-reveal-design.md):**

| Spec requirement | Covered by |
|---|---|
| Swap 4/19 fixture to Rick Ross | Task 1 |
| Drop sessionStorage preseed | Task 6 Step 1 |
| Stub `/api/music/full-track` | Task 6 Step 1 |
| `playmusic` typed live with delay 120 | Task 6 Step 2 |
| Keycap stack, top-center, dim→lit per key | Tasks 3, 4, 7 (keycap spec in scene 3) |
| Horizontal-swap slide, ~700ms, ease-in-out | Task 5 (cubic-bezier 0.7,0,0.3,1; 42 frames) |
| Clean-brand tagline (AngelFolio / angellopez.dev) | Task 5 (BrandOutro renders these) + Task 7 |
| 3 staged audio files | Task 2 |
| Rick Ross audio continues through slide + tagline | Task 7 (Scene 4 audio `durationInFrames: 2600`, spans from frame 916 to 3516) + Task 8 (`ScheduledAudio` handles fade-out) |
| Audio fades in last 600ms | Task 7 + Task 8 (fadeOutFrames via ScheduledAudio) — note: Rick Ross audio fade requires adding `fadeOutFrames: 36` on the Scene 4 audio spec; verify in Task 9 visual QA. |
| Total duration ~59s | Task 7 (durationInFrames: 3522 = 58.7s) |

**Placeholder scan:** no "TBD" / "TODO". Task 1 requires looking up the real Deezer ID for Rick Ross at execution time — this is an action, not a placeholder, and the instructions are concrete (URL, what fields to copy).

**Type consistency:** `AudioSpec` (with `at`, `fadeInFrames`, `fadeOutFrames`, `durationInFrames`), `KeycapSpec`, `BrandOutroSpec`, and the extended `Scene` are defined in Task 3 and consistently consumed in Tasks 4, 5, 7, 8.

**Scope:** one deliverable (updated `music.mp4` with the hybrid reveal). All tasks converge on that output. Not decomposable.

**Gap found during review:** The spec says "audio fade in the last 600ms" but my `script.ts` in Task 7 set `fadeOutFrames` on the preview audios but not on the Rick Ross audio. Adding now:

Edit the Rick Ross audio entry in Task 7's script.ts to include `fadeOutFrames: 36`:

```ts
audios: [
   {
      src: '/audio/music-demo-rick-ross.mp3',
      at: 16,
      volume: 0.85,
      fadeInFrames: 12,
      fadeOutFrames: 36,      // ← 600ms tail fade
      durationInFrames: 2600,
   },
],
```

This is a correction inline — when executing Task 7 Step 1, include `fadeOutFrames: 36` in the Rick Ross audio entry.
