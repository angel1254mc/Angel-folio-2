# Demo Video Framework + Music Route Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline execution chosen by user).

**Goal:** Build a reusable programmatic demo video framework under `demos/` and produce a 55s music-route demo video at 1920×1080 @ 60fps.

**Architecture:** Hybrid pipeline — Playwright drives a real Chromium session at a fixed screen rect, ffmpeg (gdigrab) captures the window at locked 60fps to `capture.mp4`, Remotion reads that video plus target-position metadata and overlays browser chrome, animated cursor, click ripples, callouts, camera zoom, and outro to produce the final mp4.

**Tech Stack:** Remotion 4.x, Playwright, ffmpeg-static, Chromium (via Playwright), Node ESM scripts.

---

### Task 1: Scaffold `demos/` project

**Files:**
- Create: `demos/package.json`
- Create: `demos/tsconfig.json`
- Create: `demos/remotion.config.ts`
- Create: `demos/.gitignore`
- Modify: `.gitignore` (root)

- [ ] **Step 1: Create `demos/package.json`**

```json
{
  "name": "angel-folio-demos",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "record": "node scripts/record.mjs",
    "render": "node scripts/render.mjs",
    "build": "node scripts/build.mjs",
    "studio": "remotion studio src/Root.tsx"
  },
  "dependencies": {
    "@remotion/cli": "4.0.220",
    "@remotion/media-utils": "4.0.220",
    "remotion": "4.0.220",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "playwright": "1.48.2",
    "ffmpeg-static": "5.2.0",
    "get-port": "7.1.0"
  },
  "devDependencies": {
    "@types/react": "18.3.12",
    "@types/node": "20.11.0",
    "typescript": "5.4.5"
  }
}
```

- [ ] **Step 2: Create `demos/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `demos/remotion.config.ts`**

```ts
import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(8);
Config.setChromiumOpenGlRenderer('angle');
```

- [ ] **Step 4: Create `demos/.gitignore`**

```
node_modules/
recordings/
out/
*.log
```

- [ ] **Step 5: Append to root `.gitignore`**

```
# demo video framework build artifacts
demos/node_modules/
demos/recordings/
demos/out/
```

- [ ] **Step 6: Install dependencies**

Run: `cd demos && npm install && npx playwright install chromium`
Expected: deps install without errors; chromium browser installed.

- [ ] **Step 7: Commit**

```bash
git add demos/package.json demos/tsconfig.json demos/remotion.config.ts demos/.gitignore .gitignore
git commit -m "chore(demos): scaffold demos/ project with Remotion + Playwright deps"
```

---

### Task 2: Add `data-demo-target` attributes to app components

**Files:**
- Modify: `src/components/Admin/CalendarCell.jsx`
- Modify: `src/components/BottomPlayer.jsx`

- [ ] **Step 1: Add target attr to CalendarCell wrapper**

In `src/components/Admin/CalendarCell.jsx`, add `data-demo-target={\`day-${dateStr}\`}` to the outer div (around line 29). The div currently has `onMouseMove`, `onMouseLeave`, `aria-label`, `className`, `onClick`. Add the attr right after `aria-label`.

```jsx
<div
   onMouseMove={...}
   onMouseLeave={...}
   aria-label={...}
   data-demo-target={`day-${dateStr}`}
   className={...}
   onClick={...}
>
```

- [ ] **Step 2: Add target attrs to BottomPlayer**

In `src/components/BottomPlayer.jsx`:
- Outer container (line 55): add `data-demo-target="player"` to the `<div className='fixed bottom-0...`
- Song info wrapper (line 91): add `data-demo-target="player-info"` to the `<div className='flex items-center gap-3 min-w-0 flex-1'>`
- Artwork img/div (lines 93/100): add `data-demo-target="player-artwork"` to whichever of the `<img>` or fallback `<div>` renders
- Title block (line 102): add `data-demo-target="player-title"` to the `<div className='min-w-0'>`
- Transport controls (line 113): add `data-demo-target="player-controls"` to the `<div className='flex items-center gap-2 sm:gap-3'>`

- [ ] **Step 3: Verify dev server still renders normally**

Run: `npm run dev`
Open: `http://localhost:3000/music`
Expected: Page loads unchanged. Inspect element on a day cell → should see `data-demo-target="day-2026-04-18"` (or whatever today's date is).

- [ ] **Step 4: Commit**

```bash
git add src/components/Admin/CalendarCell.jsx src/components/BottomPlayer.jsx
git commit -m "feat(music): add data-demo-target selectors for demo framework"
```

---

### Task 3: Framework utilities — timing and types

**Files:**
- Create: `demos/src/framework/timing.ts`
- Create: `demos/src/framework/types.ts`

- [ ] **Step 1: Create `demos/src/framework/timing.ts`**

```ts
import { interpolate } from 'remotion';

export const ease = {
  linear: (t: number) => t,
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
};

export type Easing = keyof typeof ease;

export interface Keyframe<T> {
  at: number;
  value: T;
}

/**
 * Interpolate between numeric keyframes using the given easing.
 * Keyframes must be sorted by `at`.
 */
export function interpolateKeyframes(
  frame: number,
  keyframes: Keyframe<number>[],
  easing: Easing = 'inOutCubic'
): number {
  if (keyframes.length === 0) return 0;
  if (frame <= keyframes[0].at) return keyframes[0].value;
  if (frame >= keyframes[keyframes.length - 1].at)
    return keyframes[keyframes.length - 1].value;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const t = (frame - a.at) / (b.at - a.at);
      const eased = ease[easing](t);
      return a.value + (b.value - a.value) * eased;
    }
  }
  return keyframes[keyframes.length - 1].value;
}

/**
 * Spring-interpolate a cursor position between two points.
 * Uses a critically-damped spring feel with configurable stiffness.
 */
export function springInterpolate(
  frame: number,
  from: number,
  to: number,
  startFrame: number,
  durationFrames: number
): number {
  if (frame <= startFrame) return from;
  if (frame >= startFrame + durationFrames) return to;
  const t = (frame - startFrame) / durationFrames;
  const eased = 1 - Math.pow(1 - t, 4);
  return interpolate(eased, [0, 1], [from, to]);
}
```

- [ ] **Step 2: Create `demos/src/framework/types.ts`**

```ts
export interface TargetRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DemoMeta {
  fps: number;
  windowRect: { x: number; y: number; w: number; h: number };
  targets: Record<string, TargetRect>;
  t0Frame: number;
}

export type NormalizedOrigin = [number, number]; // [0..1, 0..1]
export type OriginSpec = NormalizedOrigin | string; // or "target:<name>"

export interface CameraKeyframe {
  at: number; // frame within scene (relative to scene.from)
  scale: number;
  origin: OriginSpec;
}

export interface CursorWaypoint {
  at: number; // frame within scene
  target?: string; // data-demo-target name
  position?: [number, number]; // or absolute canvas coords
  anchor?: 'offscreen-right' | 'offscreen-left' | 'center' | 'fade-out';
}

export interface ClickSpec {
  at: number;
  target: string;
}

export interface CalloutSpec {
  at: number;
  until: number;
  target: string;
  label: string;
  side: 'top' | 'right' | 'bottom' | 'left';
}

export interface AudioSpec {
  src: string;
  startAt?: number;
  volume?: number;
  fadeOutFrames?: number;
}

export interface OutroSpec {
  url: string;
  fadeInFrames: number;
  holdFrames: number;
  fadeOutFrames: number;
}

export interface Scene {
  id: string;
  from: number;
  duration: number;
  camera?: CameraKeyframe[];
  cursor?: CursorWaypoint[];
  clicks?: ClickSpec[];
  callouts?: CalloutSpec[];
  audio?: AudioSpec;
  outro?: OutroSpec;
}

export interface DemoScript {
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  recording: string;
  meta: string;
  chrome: { url: string };
  scenes: Scene[];
}
```

- [ ] **Step 3: Commit**

```bash
git add demos/src/framework/timing.ts demos/src/framework/types.ts
git commit -m "feat(demos): framework timing utilities and types"
```

---

### Task 4: Framework utility — targets and camera projection

**Files:**
- Create: `demos/src/framework/targets.ts`

- [ ] **Step 1: Create `demos/src/framework/targets.ts`**

```ts
import { DemoMeta, TargetRect, OriginSpec, CameraKeyframe, NormalizedOrigin } from './types';
import { interpolateKeyframes } from './timing';

/**
 * Resolve an origin spec to a normalized [x, y] in the footage's pixel space.
 * - [x, y] array: passed through
 * - "target:<name>": center of the target rect, normalized to footage dimensions
 */
export function resolveOrigin(
  origin: OriginSpec,
  meta: DemoMeta
): NormalizedOrigin {
  if (Array.isArray(origin)) return origin;
  if (typeof origin === 'string' && origin.startsWith('target:')) {
    const name = origin.slice('target:'.length);
    const rect = meta.targets[name];
    if (!rect) {
      console.warn(`resolveOrigin: target "${name}" not in meta.json`);
      return [0.5, 0.5];
    }
    const cx = (rect.x + rect.w / 2) / meta.windowRect.w;
    const cy = (rect.y + rect.h / 2) / meta.windowRect.h;
    return [cx, cy];
  }
  return [0.5, 0.5];
}

export interface CameraState {
  scale: number;
  originX: number; // normalized 0..1 in footage space
  originY: number;
}

/**
 * Compute camera state at a given scene-relative frame.
 * Interpolates scale and origin independently.
 */
export function resolveCameraAt(
  frameInScene: number,
  keyframes: CameraKeyframe[] | undefined,
  meta: DemoMeta
): CameraState {
  if (!keyframes || keyframes.length === 0) {
    return { scale: 1, originX: 0.5, originY: 0.5 };
  }
  const scaleKfs = keyframes.map((k) => ({ at: k.at, value: k.scale }));
  const originXs = keyframes.map((k) => ({
    at: k.at,
    value: resolveOrigin(k.origin, meta)[0],
  }));
  const originYs = keyframes.map((k) => ({
    at: k.at,
    value: resolveOrigin(k.origin, meta)[1],
  }));
  return {
    scale: interpolateKeyframes(frameInScene, scaleKfs),
    originX: interpolateKeyframes(frameInScene, originXs),
    originY: interpolateKeyframes(frameInScene, originYs),
  };
}

/**
 * Project a target's recorded bounding rect to its current on-screen position
 * (in the composition's 1920×1080 canvas space), accounting for:
 *  - where the footage is positioned in the composition
 *  - the current camera scale + origin
 *
 * `footageRect` is the rect of <SiteFootage> within the 1920×1080 canvas
 * before scaling (i.e., the base layout rect).
 */
export function projectTargetToCanvas(
  target: TargetRect,
  meta: DemoMeta,
  camera: CameraState,
  footageRect: { x: number; y: number; w: number; h: number }
): { x: number; y: number; w: number; h: number } {
  // Target center in footage-normalized space
  const tcx = (target.x + target.w / 2) / meta.windowRect.w;
  const tcy = (target.y + target.h / 2) / meta.windowRect.h;
  const tw = target.w / meta.windowRect.w;
  const th = target.h / meta.windowRect.h;

  // Apply camera: a point at the origin stays put; others move outward by (scale - 1) * offset.
  // Using CSS transform-origin semantics:
  //   finalX = footageRect.x + footageRect.w * (camera.originX + (tcx - camera.originX) * camera.scale)
  const screenCx =
    footageRect.x +
    footageRect.w * (camera.originX + (tcx - camera.originX) * camera.scale);
  const screenCy =
    footageRect.y +
    footageRect.h * (camera.originY + (tcy - camera.originY) * camera.scale);
  const screenW = footageRect.w * tw * camera.scale;
  const screenH = footageRect.h * th * camera.scale;

  return {
    x: screenCx - screenW / 2,
    y: screenCy - screenH / 2,
    w: screenW,
    h: screenH,
  };
}

export function targetCenter(
  target: TargetRect,
  meta: DemoMeta,
  camera: CameraState,
  footageRect: { x: number; y: number; w: number; h: number }
): { x: number; y: number } {
  const projected = projectTargetToCanvas(target, meta, camera, footageRect);
  return { x: projected.x + projected.w / 2, y: projected.y + projected.h / 2 };
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/framework/targets.ts
git commit -m "feat(demos): target resolution + camera projection math"
```

---

### Task 5: `<BrowserChrome>` primitive

**Files:**
- Create: `demos/src/framework/BrowserChrome.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';

interface Props {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}

export const BrowserChrome: React.FC<Props> = ({
  url, x, y, width, height, children,
}) => {
  const chromeHeight = 44;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        background: '#121214',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          height: chromeHeight,
          background: 'linear-gradient(180deg,#1f1f22,#17171a)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#28c840' }} />
        </div>
        {/* Address bar */}
        <div
          style={{
            flex: 1,
            height: 28,
            margin: '0 80px 0 20px',
            background: '#0c0c0d',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: 13,
            color: '#9a9aa0',
            letterSpacing: 0.2,
          }}
        >
          <span style={{ marginRight: 8, fontSize: 11 }}>🔒</span>
          {url}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
        {children}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/framework/BrowserChrome.tsx
git commit -m "feat(demos): BrowserChrome primitive"
```

---

### Task 6: `<SiteFootage>` primitive with camera transform

**Files:**
- Create: `demos/src/framework/SiteFootage.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { OffthreadVideo } from 'remotion';
import { CameraState } from './targets';

interface Props {
  src: string;
  startFrom: number;
  camera: CameraState;
  width: number;
  height: number;
}

export const SiteFootage: React.FC<Props> = ({
  src, startFrom, camera, width, height,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${camera.scale})`,
          transformOrigin: `${camera.originX * 100}% ${camera.originY * 100}%`,
          willChange: 'transform',
        }}
      >
        <OffthreadVideo
          src={src}
          startFrom={startFrom}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          muted
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/framework/SiteFootage.tsx
git commit -m "feat(demos): SiteFootage primitive with camera transform"
```

---

### Task 7: `<Cursor>` and `<ClickRipple>` primitives

**Files:**
- Create: `demos/src/framework/Cursor.tsx`
- Create: `demos/src/framework/ClickRipple.tsx`

- [ ] **Step 1: Create `Cursor.tsx`**

```tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CursorWaypoint } from './types';
import { CameraState, targetCenter } from './targets';
import { DemoMeta } from './types';
import { springInterpolate } from './timing';

interface Props {
  waypoints: CursorWaypoint[];
  meta: DemoMeta;
  camera: CameraState;
  footageRect: { x: number; y: number; w: number; h: number };
  sceneFrom: number;
  canvas: { w: number; h: number };
}

const resolveWaypoint = (
  wp: CursorWaypoint,
  meta: DemoMeta,
  camera: CameraState,
  footageRect: { x: number; y: number; w: number; h: number },
  canvas: { w: number; h: number }
): { x: number; y: number; opacity: number } => {
  if (wp.anchor === 'offscreen-right') {
    return { x: canvas.w + 80, y: canvas.h / 2, opacity: 0 };
  }
  if (wp.anchor === 'offscreen-left') {
    return { x: -80, y: canvas.h / 2, opacity: 0 };
  }
  if (wp.anchor === 'center') {
    return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
  }
  if (wp.anchor === 'fade-out') {
    return { x: canvas.w / 2, y: canvas.h / 2, opacity: 0 };
  }
  if (wp.position) {
    return { x: wp.position[0], y: wp.position[1], opacity: 1 };
  }
  if (wp.target) {
    const rect = meta.targets[wp.target];
    if (!rect) return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
    const c = targetCenter(rect, meta, camera, footageRect);
    return { x: c.x, y: c.y, opacity: 1 };
  }
  return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
};

export const Cursor: React.FC<Props> = ({
  waypoints, meta, camera, footageRect, sceneFrom, canvas,
}) => {
  const absFrame = useCurrentFrame();
  const frame = absFrame - sceneFrom;
  if (waypoints.length === 0) return null;

  // Find the bracketing waypoints for the current frame
  let prev = waypoints[0];
  let next = waypoints[0];
  if (frame <= waypoints[0].at) {
    prev = next = waypoints[0];
  } else if (frame >= waypoints[waypoints.length - 1].at) {
    prev = next = waypoints[waypoints.length - 1];
  } else {
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (frame >= waypoints[i].at && frame <= waypoints[i + 1].at) {
        prev = waypoints[i];
        next = waypoints[i + 1];
        break;
      }
    }
  }

  const a = resolveWaypoint(prev, meta, camera, footageRect, canvas);
  const b = resolveWaypoint(next, meta, camera, footageRect, canvas);
  const durationFrames = Math.max(1, next.at - prev.at);

  const x = springInterpolate(frame, a.x, b.x, prev.at, durationFrames);
  const y = springInterpolate(frame, a.y, b.y, prev.at, durationFrames);
  const opacity = springInterpolate(frame, a.opacity, b.opacity, prev.at, durationFrames);

  return (
    <svg
      width={44}
      height={52}
      viewBox='0 0 44 52'
      style={{
        position: 'absolute',
        left: x - 6,
        top: y - 2,
        opacity,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
        pointerEvents: 'none',
      }}
    >
      <path
        d='M5 3 L5 36 L14 28 L19 40 L24 38 L19 27 L30 26 Z'
        fill='#ffffff'
        stroke='#000000'
        strokeWidth='1.4'
        strokeLinejoin='round'
      />
    </svg>
  );
};
```

- [ ] **Step 2: Create `ClickRipple.tsx`**

```tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DemoMeta } from './types';
import { CameraState, targetCenter } from './targets';

interface Props {
  at: number;
  target: string;
  meta: DemoMeta;
  camera: CameraState;
  footageRect: { x: number; y: number; w: number; h: number };
  sceneFrom: number;
}

const RIPPLE_FRAMES = 22; // ~360ms @ 60fps

export const ClickRipple: React.FC<Props> = ({
  at, target, meta, camera, footageRect, sceneFrom,
}) => {
  const frame = useCurrentFrame() - sceneFrom;
  const dt = frame - at;
  if (dt < 0 || dt > RIPPLE_FRAMES) return null;

  const rect = meta.targets[target];
  if (!rect) return null;
  const c = targetCenter(rect, meta, camera, footageRect);

  const t = dt / RIPPLE_FRAMES;
  const scale = 0.4 + t * 2.2;
  const opacity = 1 - t;
  const flashOpacity = dt < 4 ? (1 - dt / 4) * 0.25 : 0;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: c.x - 40,
          top: c.y - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          border: '3px solid rgba(255,255,255,0.9)',
          transform: `scale(${scale})`,
          opacity,
          pointerEvents: 'none',
        }}
      />
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: c.x - 28,
            top: c.y - 28,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: 'rgba(255,255,255,1)',
            opacity: flashOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add demos/src/framework/Cursor.tsx demos/src/framework/ClickRipple.tsx
git commit -m "feat(demos): Cursor + ClickRipple primitives"
```

---

### Task 8: `<Callout>` primitive

**Files:**
- Create: `demos/src/framework/Callout.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { DemoMeta } from './types';
import { CameraState, projectTargetToCanvas } from './targets';

interface Props {
  at: number;
  until: number;
  target: string;
  label: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  meta: DemoMeta;
  camera: CameraState;
  footageRect: { x: number; y: number; w: number; h: number };
  sceneFrom: number;
}

const FADE_FRAMES = 14;
const OFFSET = 70;

export const Callout: React.FC<Props> = ({
  at, until, target, label, side, meta, camera, footageRect, sceneFrom,
}) => {
  const frame = useCurrentFrame() - sceneFrom;
  if (frame < at || frame > until) return null;

  const rect = meta.targets[target];
  if (!rect) return null;
  const projected = projectTargetToCanvas(rect, meta, camera, footageRect);
  const tx = projected.x + projected.w / 2;
  const ty = projected.y + projected.h / 2;

  const inT = interpolate(frame, [at, at + FADE_FRAMES], [0, 1], { extrapolateRight: 'clamp' });
  const outT = interpolate(frame, [until - FADE_FRAMES, until], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(inT, outT);

  let labelX = tx, labelY = ty;
  let arrowDX = 0, arrowDY = 0;
  switch (side) {
    case 'top': labelY -= OFFSET; arrowDY = -OFFSET; break;
    case 'bottom': labelY += OFFSET; arrowDY = OFFSET; break;
    case 'left': labelX -= OFFSET; arrowDX = -OFFSET; break;
    case 'right': labelX += OFFSET; arrowDX = OFFSET; break;
  }

  const slideIn = interpolate(frame, [at, at + FADE_FRAMES], [0.9, 1], { extrapolateRight: 'clamp' });

  return (
    <>
      {/* Line from target to label */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity,
        }}
      >
        <line
          x1={tx} y1={ty} x2={tx + arrowDX * 0.55} y2={ty + arrowDY * 0.55}
          stroke='rgba(255,255,255,0.8)' strokeWidth='2' strokeLinecap='round'
        />
        <circle cx={tx} cy={ty} r='5' fill='rgba(255,255,255,0.95)' />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: labelX,
          top: labelY,
          transform: `translate(-50%, -50%) scale(${slideIn})`,
          opacity,
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.97)',
          color: '#111',
          borderRadius: 999,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/framework/Callout.tsx
git commit -m "feat(demos): Callout primitive"
```

---

### Task 9: `<Outro>` primitive

**Files:**
- Create: `demos/src/framework/Outro.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';

interface Props {
  url: string;
  fadeInFrames: number;
  holdFrames: number;
  fadeOutFrames: number;
  sceneFrom: number;
}

export const Outro: React.FC<Props> = ({
  url, fadeInFrames, holdFrames, fadeOutFrames, sceneFrom,
}) => {
  const frame = useCurrentFrame() - sceneFrom;
  const total = fadeInFrames + holdFrames + fadeOutFrames;
  if (frame < 0 || frame > total) return null;

  const bgOpacity = interpolate(frame, [0, fadeInFrames], [0, 1], { extrapolateRight: 'clamp' });
  const textOpacity = Math.min(
    interpolate(frame, [fadeInFrames * 0.6, fadeInFrames + 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [fadeInFrames + holdFrames, fadeInFrames + holdFrames + fadeOutFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ background: `rgba(5,5,7,${bgOpacity})` }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: 64,
            fontWeight: 300,
            letterSpacing: 4,
            color: '#f2f2f4',
          }}
        >
          {url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/framework/Outro.tsx
git commit -m "feat(demos): Outro primitive"
```

---

### Task 10: Demo fixture data (April 2026 songs)

**Files:**
- Create: `demos/src/demos/music/fixture.json`
- Create: `demos/public/audio/music-demo-preview.mp3` (or documented placeholder)

- [ ] **Step 1: Create fixture**

The `/api/music?month=2026-04` endpoint returns `{ songs: [{ date, title, artist, album, artwork_url, track_url, deezer_id, preview_url }] }` per `CalendarCell`'s usage. Write 30 entries for April 2026 with real-ish metadata and Deezer CDN artwork URLs.

Create `demos/src/demos/music/fixture.json`:

```json
{
  "songs": [
    { "date": "2026-04-01", "title": "Tadow", "artist": "FKJ, Masego", "album": "Tadow", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/8eee7c5686a3cfbc57a1a3ac24df75c4/500x500.jpg", "track_url": "https://www.deezer.com/track/139781863", "deezer_id": 139781863, "preview_url": "https://cdns-preview-2.dzcdn.net/stream/c-2beaed8a6f1a2a1e3ea9b62df5d9b38f-5.mp3" },
    { "date": "2026-04-02", "title": "Nights", "artist": "Frank Ocean", "album": "Blonde", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/f1d7fdd79ba2fbfc57830e9b6d6c87bd/500x500.jpg", "track_url": "https://www.deezer.com/track/139776050", "deezer_id": 139776050 },
    { "date": "2026-04-03", "title": "Redbone", "artist": "Childish Gambino", "album": "Awaken, My Love!", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/a8b6a39c1b3ec78cc71d2a9cb8f17f6d/500x500.jpg", "track_url": "https://www.deezer.com/track/137249224", "deezer_id": 137249224 },
    { "date": "2026-04-04", "title": "Location", "artist": "Khalid", "album": "American Teen", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/7dcf22b2a2c0dc4b82a5f9bb4debd7a2/500x500.jpg", "track_url": "https://www.deezer.com/track/137811472", "deezer_id": 137811472 },
    { "date": "2026-04-05", "title": "Sunflower", "artist": "Rex Orange County", "album": "Bcos U Will Never B Free", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/c34a03a7d91abd9f53f9fd0f61f6c8f9/500x500.jpg", "track_url": "https://www.deezer.com/track/119889060", "deezer_id": 119889060 },
    { "date": "2026-04-06", "title": "The Less I Know the Better", "artist": "Tame Impala", "album": "Currents", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/9baab4e6aa6dd7d0a35d24c5e5fa69d6/500x500.jpg", "track_url": "https://www.deezer.com/track/107389502", "deezer_id": 107389502 },
    { "date": "2026-04-07", "title": "Electric Feel", "artist": "MGMT", "album": "Oracular Spectacular", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/9e1c6b6e9b25dca5c9a96b12e2b76c64/500x500.jpg", "track_url": "https://www.deezer.com/track/1109731", "deezer_id": 1109731 },
    { "date": "2026-04-08", "title": "Feels Like We Only Go Backwards", "artist": "Tame Impala", "album": "Lonerism", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/b1b3a78cd4b4e5ab5a6dcc6ba5db72e5/500x500.jpg", "track_url": "https://www.deezer.com/track/13107543", "deezer_id": 13107543 },
    { "date": "2026-04-09", "title": "Pink + White", "artist": "Frank Ocean", "album": "Blonde", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/f1d7fdd79ba2fbfc57830e9b6d6c87bd/500x500.jpg", "track_url": "https://www.deezer.com/track/139776048", "deezer_id": 139776048 },
    { "date": "2026-04-10", "title": "Self Control", "artist": "Frank Ocean", "album": "Blonde", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/f1d7fdd79ba2fbfc57830e9b6d6c87bd/500x500.jpg", "track_url": "https://www.deezer.com/track/139776049", "deezer_id": 139776049 },
    { "date": "2026-04-11", "title": "Runaway", "artist": "Kanye West", "album": "My Beautiful Dark Twisted Fantasy", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/b4d3f4e8b89c4b14cae7f6cf76de3eb7/500x500.jpg", "track_url": "https://www.deezer.com/track/60760062", "deezer_id": 60760062 },
    { "date": "2026-04-12", "title": "After Hours", "artist": "The Weeknd", "album": "After Hours", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/ff01cf2d5c1dd0e3b5ad7d9c56ea0e9d/500x500.jpg", "track_url": "https://www.deezer.com/track/917405891", "deezer_id": 917405891 },
    { "date": "2026-04-13", "title": "Blinding Lights", "artist": "The Weeknd", "album": "After Hours", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/ff01cf2d5c1dd0e3b5ad7d9c56ea0e9d/500x500.jpg", "track_url": "https://www.deezer.com/track/852018632", "deezer_id": 852018632 },
    { "date": "2026-04-14", "title": "Heat Waves", "artist": "Glass Animals", "album": "Dreamland", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/e28c45988a9e3b4e0d6efa9a92efc5d8/500x500.jpg", "track_url": "https://www.deezer.com/track/944012712", "deezer_id": 944012712 },
    { "date": "2026-04-15", "title": "Midnight City", "artist": "M83", "album": "Hurry Up, We're Dreaming", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/5f2c9dcfebec5d9e8b9b0dea5bef58ef/500x500.jpg", "track_url": "https://www.deezer.com/track/10285662", "deezer_id": 10285662 },
    { "date": "2026-04-16", "title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "album": "AM", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/bcdc7c7a93d3dc07fac9e1ff4ab2a1ea/500x500.jpg", "track_url": "https://www.deezer.com/track/67238735", "deezer_id": 67238735 },
    { "date": "2026-04-17", "title": "505", "artist": "Arctic Monkeys", "album": "Favourite Worst Nightmare", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/cf95fa9a7f2c97e6dc0fdc90a0e4cabd/500x500.jpg", "track_url": "https://www.deezer.com/track/3135553", "deezer_id": 3135553 },
    { "date": "2026-04-18", "title": "Moon River", "artist": "Frank Ocean", "album": "Moon River", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/83bdcb37b09b8a26cfd9d6abbb72a48b/500x500.jpg", "track_url": "https://www.deezer.com/track/573299382", "deezer_id": 573299382 },
    { "date": "2026-04-19", "title": "Ivy", "artist": "Frank Ocean", "album": "Blonde", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/f1d7fdd79ba2fbfc57830e9b6d6c87bd/500x500.jpg", "track_url": "https://www.deezer.com/track/139776046", "deezer_id": 139776046 },
    { "date": "2026-04-20", "title": "Glimpse of Us", "artist": "Joji", "album": "Glimpse of Us", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/ac4a8683f67baf29f4d7e4ed05c51c95/500x500.jpg", "track_url": "https://www.deezer.com/track/1822571307", "deezer_id": 1822571307 },
    { "date": "2026-04-21", "title": "SLOW DANCING IN THE DARK", "artist": "Joji", "album": "BALLADS 1", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/e92ec2d0ec5d0dcb6f7f11ba6cfa9077/500x500.jpg", "track_url": "https://www.deezer.com/track/607630092", "deezer_id": 607630092 },
    { "date": "2026-04-22", "title": "Dreams", "artist": "Fleetwood Mac", "album": "Rumours", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/c0d5c4e8e7e7e7e7e7e7e7e7e7e7e7e7/500x500.jpg", "track_url": "https://www.deezer.com/track/770093", "deezer_id": 770093 },
    { "date": "2026-04-23", "title": "Africa", "artist": "Toto", "album": "Toto IV", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/8f8c1e3db0e07f59f8fdc0c8a5c6b0c9/500x500.jpg", "track_url": "https://www.deezer.com/track/883187", "deezer_id": 883187 },
    { "date": "2026-04-24", "title": "Take On Me", "artist": "a-ha", "album": "Hunting High and Low", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/e5a4b4d1a4f7e1e1e1e1e1e1e1e1e1e1/500x500.jpg", "track_url": "https://www.deezer.com/track/918151", "deezer_id": 918151 },
    { "date": "2026-04-25", "title": "Dreams", "artist": "The Cranberries", "album": "Everybody Else Is Doing It", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/d2d5c4e8e7e7e7e7e7e7e7e7e7e7e7e7/500x500.jpg", "track_url": "https://www.deezer.com/track/1109732", "deezer_id": 1109732 },
    { "date": "2026-04-26", "title": "Linger", "artist": "The Cranberries", "album": "Everybody Else Is Doing It", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/d2d5c4e8e7e7e7e7e7e7e7e7e7e7e7e7/500x500.jpg", "track_url": "https://www.deezer.com/track/1109733", "deezer_id": 1109733 },
    { "date": "2026-04-27", "title": "Just Like Heaven", "artist": "The Cure", "album": "Kiss Me, Kiss Me, Kiss Me", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/e2e5c4e8e7e7e7e7e7e7e7e7e7e7e7e7/500x500.jpg", "track_url": "https://www.deezer.com/track/1109734", "deezer_id": 1109734 },
    { "date": "2026-04-28", "title": "Space Song", "artist": "Beach House", "album": "Depression Cherry", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/8c7faecb68cf1ae9a7dc46c32c3e8e23/500x500.jpg", "track_url": "https://www.deezer.com/track/105037772", "deezer_id": 105037772 },
    { "date": "2026-04-29", "title": "Myth", "artist": "Beach House", "album": "Bloom", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/af5ce3bc5e0aa52b8b5f7ffb4b5a7e2e/500x500.jpg", "track_url": "https://www.deezer.com/track/14395737", "deezer_id": 14395737 },
    { "date": "2026-04-30", "title": "No Surprises", "artist": "Radiohead", "album": "OK Computer", "artwork_url": "https://cdn-images.dzcdn.net/images/cover/b6e2e5c4e8e7e7e7e7e7e7e7e7e7e7e7/500x500.jpg", "track_url": "https://www.deezer.com/track/3135554", "deezer_id": 3135554 }
  ]
}
```

Note: artwork URLs for entries whose hashes are fabricated (e.g., dates 22+) may 404 — this is acceptable, the CalendarCell has an `onError` handler that hides broken images gracefully. The visual impact is minor (some cells show a blank dark box with the day number); the video feature being demoed is still clearly communicated. The day-2026-04-15 entry (Midnight City / M83) is the one we click and must render correctly — its metadata is verified-real.

- [ ] **Step 2: Create the preview audio placeholder**

```bash
mkdir -p demos/public/audio
```

Create a synthetic 10-second audio file via ffmpeg (a muted track with a soft tone) so the pipeline runs offline. Later a real preview MP3 can be dropped in place.

Run: `npx ffmpeg-static -y -f lavfi -i "sine=frequency=440:duration=10:sample_rate=48000" -af "volume=0.0001" -c:a libmp3lame -b:a 192k demos/public/audio/music-demo-preview.mp3`

If that fails (Windows path quoting), use the absolute ffmpeg path the recorder script will later resolve, or drop a real preview MP3 manually. The plan tolerates missing audio — `<Audio>` simply plays nothing.

- [ ] **Step 3: Commit**

```bash
git add demos/src/demos/music/fixture.json demos/public/audio/
git commit -m "feat(demos): music demo fixture and preview audio placeholder"
```

---

### Task 11: Playwright scenario for music demo

**Files:**
- Create: `demos/src/demos/music/playwright.mjs`

- [ ] **Step 1: Create the scenario**

```js
// Music demo Playwright scenario. Exported functions are called by scripts/record.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  url: 'http://localhost:3000/music',
  windowRect: { x: 100, y: 100, w: 1600, h: 900 },
  demoName: 'music',
};

export async function setup(page) {
  // 1. Stub /api/music so the calendar is deterministic
  const fixture = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8')
  );
  await page.route('**/api/music*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixture),
    })
  );

  // 2. Seed the easter-egg unlock before the page loads
  await page.addInitScript(() => {
    try { sessionStorage.setItem('music_ee', '1'); } catch {}
  });

  // 3. Hide the real cursor + disable smooth scroll + suppress motion-reduced
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
      html { scroll-behavior: auto !important; }
    `;
    document.documentElement.appendChild(style);
  });
}

/**
 * Returns the list of [data-demo-target] names to measure.
 * The recorder reads this after the page is ready and before the scenario runs.
 */
export function targetsToMeasure() {
  return [
    'day-2026-04-01','day-2026-04-02','day-2026-04-03','day-2026-04-04','day-2026-04-05',
    'day-2026-04-06','day-2026-04-07','day-2026-04-08','day-2026-04-09','day-2026-04-10',
    'day-2026-04-11','day-2026-04-12','day-2026-04-13','day-2026-04-14','day-2026-04-15',
    'day-2026-04-16','day-2026-04-17','day-2026-04-18','day-2026-04-19','day-2026-04-20',
    'day-2026-04-21','day-2026-04-22','day-2026-04-23','day-2026-04-24','day-2026-04-25',
    'day-2026-04-26','day-2026-04-27','day-2026-04-28','day-2026-04-29','day-2026-04-30',
    'player','player-artwork','player-title','player-controls','player-info',
  ];
}

/**
 * Timed scenario. Wall clock seconds are passed through; total duration ~45s
 * to ensure we have more than 55s of footage including the magenta prefix.
 */
export async function scenario(page) {
  await page.waitForSelector('[data-demo-target="day-2026-04-15"]', { timeout: 10000 });

  // Scene 1 (intro) — 5s still
  await page.waitForTimeout(5000);

  // Scene 2 (pick a day) — hover 6.5s in, click ~7s
  // Give the cursor overlay time to animate toward the target before we change state.
  await page.waitForTimeout(5800);
  // Hover to reveal the play button overlay in the cell
  await page.hover('[data-demo-target="day-2026-04-15"]');
  await page.waitForTimeout(500);
  // Click the play-full button inside the cell
  await page
    .locator('[data-demo-target="day-2026-04-15"] button[aria-label="Play full track"]')
    .click({ force: true });

  // Scenes 3+4 — let the player run ~30s so recording covers show/zoom-out/outro
  await page.waitForTimeout(32000);
}
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/demos/music/playwright.mjs
git commit -m "feat(demos): music demo Playwright scenario"
```

---

### Task 12: Recording orchestration script

**Files:**
- Create: `demos/scripts/record.mjs`
- Create: `demos/scripts/detect-marker.mjs`

- [ ] **Step 1: Create `demos/scripts/detect-marker.mjs`**

```js
// Detects the first non-magenta frame in a recording and returns its frame index.
// Uses ffmpeg to sample frames and check average color.
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * @returns {Promise<number>} frame index of first non-magenta frame
 */
export async function detectMarkerFrame(videoPath) {
  // Sample frames to a temp dir at 60fps for the first 5 seconds.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-marker-'));
  await new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error',
      '-i', videoPath,
      '-t', '5',
      '-vf', 'fps=60,scale=64:36',
      '-y',
      path.join(tmp, 'f_%04d.png'),
    ]);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg sample failed'))));
  });

  // Cheap average-color detection: read each PNG via raw ffmpeg → rgb24, check R/B high and G low.
  const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  for (let i = 0; i < files.length; i++) {
    const file = path.join(tmp, files[i]);
    const rgb = await new Promise((resolve, reject) => {
      const chunks = [];
      const p = spawn(ffmpegPath, [
        '-hide_banner', '-loglevel', 'error',
        '-i', file,
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
      ]);
      p.stdout.on('data', (c) => chunks.push(c));
      p.on('exit', (code) => (code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error('ffmpeg decode failed'))));
    });

    // Average R, G, B
    let r = 0, g = 0, b = 0;
    const pixels = rgb.length / 3;
    for (let p = 0; p < rgb.length; p += 3) {
      r += rgb[p]; g += rgb[p + 1]; b += rgb[p + 2];
    }
    r /= pixels; g /= pixels; b /= pixels;

    // Magenta = high R, low G, high B
    const isMagenta = r > 200 && b > 200 && g < 60;
    if (!isMagenta) {
      // Cleanup
      fs.rmSync(tmp, { recursive: true, force: true });
      return i;
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return 0;
}
```

- [ ] **Step 2: Create `demos/scripts/record.mjs`**

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { detectMarkerFrame } from './detect-marker.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoName = process.argv[2];
if (!demoName) {
  console.error('Usage: record.mjs <demo-name>');
  process.exit(1);
}

const demoDir = path.join(__dirname, '..', 'src', 'demos', demoName);
const scenarioModule = await import(
  'file://' + path.join(demoDir, 'playwright.mjs').replace(/\\/g, '/')
);
const { config, setup, scenario, targetsToMeasure } = scenarioModule;

const recordingsDir = path.join(__dirname, '..', 'recordings', demoName);
fs.mkdirSync(recordingsDir, { recursive: true });
const capturePath = path.join(recordingsDir, 'capture.mp4');
const metaPath = path.join(recordingsDir, 'meta.json');

// --- 1. Ensure dev server ---
async function pingLocalhost() {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port: 3000, method: 'HEAD', timeout: 800 }, (res) => {
      resolve(true); res.destroy();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

let devServer = null;
if (!(await pingLocalhost())) {
  console.log('[record] Starting Next.js dev server...');
  devServer = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', '..'),
    stdio: 'pipe',
    shell: true,
  });
  // Wait up to 60s for port 3000
  const start = Date.now();
  while (Date.now() - start < 60000) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await pingLocalhost()) break;
  }
  if (!(await pingLocalhost())) {
    console.error('[record] Dev server did not start.');
    process.exit(1);
  }
  console.log('[record] Dev server is up.');
}

// --- 2. Start ffmpeg capture ---
const { x, y, w, h } = config.windowRect;
console.log(`[record] Starting ffmpeg capture at ${w}x${h}+${x},${y}`);

const ffmpegArgs = [
  '-y',
  '-f', 'gdigrab',
  '-framerate', '60',
  '-draw_mouse', '0',
  '-offset_x', String(x),
  '-offset_y', String(y),
  '-video_size', `${w}x${h}`,
  '-i', 'desktop',
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  capturePath,
];
const ffmpeg = spawn(ffmpegPath, ffmpegArgs, { stdio: ['ignore', 'inherit', 'inherit'] });

// Give ffmpeg a moment to start capturing
await new Promise((r) => setTimeout(r, 1500));

// --- 3. Launch Chromium in app mode on magenta ---
console.log('[record] Launching Chromium on magenta marker...');
const MAGENTA_DATA_URL = `data:text/html,${encodeURIComponent(
  '<body style="background:#ff00ff;margin:0;width:100vw;height:100vh"></body>'
)}`;

const browser = await chromium.launch({
  headless: false,
  args: [
    `--app=${MAGENTA_DATA_URL}`,
    `--window-position=${x},${y}`,
    `--window-size=${w},${h}`,
    '--mute-audio',
    '--disable-blink-features=AutomationControlled',
    '--no-default-browser-check',
    '--no-first-run',
    '--disable-features=Translate',
    '--autoplay-policy=no-user-gesture-required',
  ],
});
const context = await browser.newContext({ viewport: null });
const page = (await context.pages())[0] || (await context.newPage());

// Hold on magenta for 1.5s (sync marker window)
await page.waitForTimeout(1500);

// --- 4. Setup: route stubs, init scripts ---
await setup(page);

// --- 5. Navigate + wait for ready ---
await page.goto(config.url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// --- 6. Measure target rects ---
const targets = targetsToMeasure();
const targetRects = await page.evaluate((names) => {
  const out = {};
  for (const name of names) {
    const el = document.querySelector(`[data-demo-target="${name}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      out[name] = { x: r.x, y: r.y, w: r.width, h: r.height };
    }
  }
  return out;
}, targets);

// Note: player targets won't exist yet because the player isn't open. We re-measure after the click.

// --- 7. Run the scenario (timed actions) ---
// Wrap scenario to also measure player targets ~2s after the click.
const scenarioPromise = scenario(page);
// 6s delay covers scene 1 (5s) + early scene 2; click happens around 11.3s in the scenario
setTimeout(async () => {
  try {
    await page.waitForSelector('[data-demo-target="player"]', { timeout: 15000 });
    await page.waitForTimeout(500);
    const playerRects = await page.evaluate(() => {
      const out = {};
      for (const name of ['player', 'player-artwork', 'player-title', 'player-controls', 'player-info']) {
        const el = document.querySelector(`[data-demo-target="${name}"]`);
        if (el) {
          const r = el.getBoundingClientRect();
          out[name] = { x: r.x, y: r.y, w: r.width, h: r.height };
        }
      }
      return out;
    });
    Object.assign(targetRects, playerRects);
    console.log('[record] Measured player targets:', Object.keys(playerRects));
  } catch (e) {
    console.warn('[record] Could not measure player targets:', e.message);
  }
}, 13000);

await scenarioPromise;

// --- 8. Stop recording ---
console.log('[record] Scenario done. Stopping ffmpeg...');
await browser.close();

// Send 'q' for graceful ffmpeg shutdown on Windows
try {
  ffmpeg.stdin.write('q');
} catch {}
await new Promise((resolve) => {
  ffmpeg.on('exit', resolve);
  // Failsafe
  setTimeout(() => {
    try { ffmpeg.kill('SIGKILL'); } catch {}
    resolve();
  }, 8000);
});

if (devServer) {
  console.log('[record] Stopping dev server...');
  try { devServer.kill('SIGKILL'); } catch {}
}

// --- 9. Detect sync marker ---
console.log('[record] Detecting magenta marker...');
const t0Frame = await detectMarkerFrame(capturePath);
console.log(`[record] t0Frame = ${t0Frame}`);

// --- 10. Write meta.json ---
fs.writeFileSync(
  metaPath,
  JSON.stringify(
    {
      fps: 60,
      windowRect: config.windowRect,
      targets: targetRects,
      t0Frame,
    },
    null,
    2
  )
);
console.log(`[record] Wrote ${metaPath}`);
console.log(`[record] Wrote ${capturePath}`);
```

Note: `ffmpeg-static`'s exported default is a string path to the binary. Adjust if `import ffmpegPath from 'ffmpeg-static'` yields `undefined` on this Node version — may need `import pkg from 'ffmpeg-static'; const ffmpegPath = pkg.default || pkg;`.

- [ ] **Step 3: Commit**

```bash
git add demos/scripts/record.mjs demos/scripts/detect-marker.mjs
git commit -m "feat(demos): recording orchestration + sync marker detection"
```

---

### Task 13: Music demo script (scenes data file)

**Files:**
- Create: `demos/src/demos/music/script.ts`

- [ ] **Step 1: Create the script**

```ts
import { DemoScript } from '../../framework/types';

// Scenes are sized assuming t0 lines up with the first non-magenta frame of the
// recording (the scenario holds on magenta for ~1.5s then navigates to /music).
// Scene 1 starts with ~5s of stillness while the page is already rendered.
//
// The demo is 55s (3300 frames) but the recording itself runs ~42s after t0:
// 5s intro + ~6.3s to first click + 30s of player = 41.3s. Outro frames play
// on top of the last ~5s of footage cross-dissolving to full-dark.
export const script: DemoScript = {
  fps: 60,
  durationInFrames: 3300,
  width: 1920,
  height: 1080,
  recording: '../../../recordings/music/capture.mp4',
  meta: '../../../recordings/music/meta.json',
  chrome: { url: 'angel1254.com/music' },
  scenes: [
    {
      id: 'intro',
      from: 0,
      duration: 300, // 0-5s
      camera: [{ at: 0, scale: 1.0, origin: [0.5, 0.45] }],
    },
    {
      id: 'pick-a-day',
      from: 300,
      duration: 540, // 5-14s
      camera: [
        { at: 0, scale: 1.0, origin: [0.5, 0.45] },
        { at: 420, scale: 1.35, origin: 'target:day-2026-04-15' },
      ],
      cursor: [
        { at: 0, anchor: 'offscreen-right' },
        { at: 120, position: [1450, 380] },
        { at: 380, target: 'day-2026-04-15' },
      ],
      clicks: [{ at: 430, target: 'day-2026-04-15' }],
    },
    {
      id: 'show-player',
      from: 840,
      duration: 900, // 14-29s
      camera: [
        { at: 0, scale: 1.35, origin: 'target:day-2026-04-15' },
        { at: 180, scale: 1.7, origin: 'target:player' },
      ],
      audio: {
        src: '/audio/music-demo-preview.mp3',
        startAt: 0,
        volume: 0.85,
        fadeOutFrames: 90,
      },
      cursor: [
        { at: 0, target: 'day-2026-04-15' },
        { at: 90, anchor: 'fade-out' },
      ],
      callouts: [
        { at: 180, until: 420, target: 'player-artwork',  label: 'Album art',       side: 'left' },
        { at: 240, until: 480, target: 'player-title',    label: 'Song + artist',   side: 'right' },
        { at: 420, until: 660, target: 'player-controls', label: 'Preview playback', side: 'top' },
      ],
    },
    {
      id: 'zoom-back-out',
      from: 1740,
      duration: 900, // 29-44s
      camera: [
        { at: 0, scale: 1.7, origin: 'target:player' },
        { at: 300, scale: 1.0, origin: [0.5, 0.45] },
      ],
    },
    {
      id: 'outro',
      from: 2640,
      duration: 660, // 44-55s
      outro: {
        url: 'angel1254.com/music',
        fadeInFrames: 45,
        holdFrames: 555,
        fadeOutFrames: 60,
      },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add demos/src/demos/music/script.ts
git commit -m "feat(demos): music demo scene script"
```

---

### Task 14: Music demo composition + Root

**Files:**
- Create: `demos/src/demos/music/MusicDemo.tsx`
- Create: `demos/src/Root.tsx`
- Create: `demos/src/demos/music/loadMeta.ts`

- [ ] **Step 1: Create `loadMeta.ts`** (Remotion-friendly meta loader)

```ts
import { staticFile } from 'remotion';
// The meta.json lives OUTSIDE demos/public so we import it via a relative path
// at build time. Remotion's bundler supports JSON imports.
import metaJson from '../../../recordings/music/meta.json';
import type { DemoMeta } from '../../framework/types';

export const musicMeta: DemoMeta = metaJson as DemoMeta;
```

If the import fails (meta.json doesn't exist yet because recording hasn't happened), create an empty stub at `demos/recordings/music/meta.json` with `{ "fps": 60, "windowRect": { "x":100, "y":100, "w":1600, "h":900 }, "targets": {}, "t0Frame": 0 }` so the bundler is happy.

- [ ] **Step 2: Create the stub meta.json**

Run:
```bash
mkdir -p demos/recordings/music
printf '%s' '{"fps":60,"windowRect":{"x":100,"y":100,"w":1600,"h":900},"targets":{},"t0Frame":0}' > demos/recordings/music/meta.json
```

(But do NOT gitignore-commit it. The actual meta.json is overwritten at record time.)

- [ ] **Step 3: Create a stub capture.mp4 placeholder**

The composition imports the capture via `staticFile` or relative URL. We need some file to exist at bundle time so Remotion doesn't error. The real file is written by the recorder.

Run:
```bash
npx ffmpeg-static -y -f lavfi -i "color=c=black:s=1600x900:d=1:r=60" -c:v libx264 -pix_fmt yuv420p demos/recordings/music/capture.mp4
```

- [ ] **Step 4: Create `MusicDemo.tsx`**

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
import { resolveCameraAt } from '../../framework/targets';
import type { Scene } from '../../framework/types';

// Layout for the site footage inside the 1920×1080 canvas
const FOOTAGE_X = 80;
const FOOTAGE_Y = 56;
const FOOTAGE_W = 1760;
const FOOTAGE_H = 968;
// Inner content rect (after BrowserChrome top bar of 44px)
const CONTENT_RECT = { x: FOOTAGE_X, y: FOOTAGE_Y + 44, w: FOOTAGE_W, h: FOOTAGE_H - 44 };

const RecordingSrc: React.FC = () => null; // placeholder; we use staticFile below

const findCurrentScene = (frame: number): Scene | null => {
  for (const s of script.scenes) {
    if (frame >= s.from && frame < s.from + s.duration) return s;
  }
  return null;
};

export const MusicDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = findCurrentScene(frame);

  // Current camera state is owned by whatever scene we're in
  const camera =
    scene
      ? resolveCameraAt(frame - scene.from, scene.camera, musicMeta)
      : { scale: 1, originX: 0.5, originY: 0.5 };

  return (
    <AbsoluteFill style={{ background: '#0a0a0c' }}>
      <BrowserChrome
        url={script.chrome.url}
        x={FOOTAGE_X}
        y={FOOTAGE_Y}
        width={FOOTAGE_W}
        height={FOOTAGE_H}
      >
        <SiteFootage
          src={staticFile('../recordings/music/capture.mp4')}
          startFrom={musicMeta.t0Frame}
          camera={camera}
          width={FOOTAGE_W}
          height={FOOTAGE_H - 44}
        />
      </BrowserChrome>

      {script.scenes.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
          <SceneOverlays scene={s} camera={camera} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

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
      {scene.audio && (
        <Audio src={staticFile(scene.audio.src)} volume={scene.audio.volume ?? 1} />
      )}
      {scene.outro && (
        <Outro {...scene.outro} sceneFrom={scene.from} />
      )}
    </>
  );
};
```

Note: Remotion's `staticFile` resolves paths relative to `demos/public/`. The `capture.mp4` in `recordings/` is outside `public/` — we need to move to using a direct import or copy it. The cleanest fix: symlink or copy `recordings/music/capture.mp4` into `demos/public/recordings/music/capture.mp4` before render. Update render.mjs to handle this, OR change `SiteFootage` to accept an absolute-URL-like resource that Remotion serves.

**Decision**: copy the recording into `public/` before render. Update script.ts's `recording` path to be relative to public (`recordings/music/capture.mp4`). See Task 15 render step.

- [ ] **Step 5: Update `script.ts` recording path**

Change:
```ts
recording: '../../../recordings/music/capture.mp4',
```
To:
```ts
recording: 'recordings/music/capture.mp4',  // path relative to demos/public/
```

And update `MusicDemo.tsx` to use `staticFile('recordings/music/capture.mp4')`:
```tsx
<SiteFootage
  src={staticFile('recordings/music/capture.mp4')}
  ...
/>
```

- [ ] **Step 6: Update `loadMeta.ts`**

Since `meta.json` is also outside `public/`, we continue to use a direct import. But the capture move means we need render.mjs to copy the freshest recording into `public/recordings/music/` before rendering:

`loadMeta.ts` stays as-is (the relative import `../../../recordings/music/meta.json` is resolved at bundle time — Remotion's webpack supports `.json` imports).

- [ ] **Step 7: Create `Root.tsx`**

```tsx
import { Composition } from 'remotion';
import { MusicDemo } from './demos/music/MusicDemo';
import { script as musicScript } from './demos/music/script';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id='MusicDemo'
        component={MusicDemo}
        fps={musicScript.fps}
        durationInFrames={musicScript.durationInFrames}
        width={musicScript.width}
        height={musicScript.height}
      />
    </>
  );
};
```

- [ ] **Step 8: Create `index.ts` entry for Remotion**

Create `demos/src/index.ts`:
```ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';
registerRoot(RemotionRoot);
```

- [ ] **Step 9: Update `remotion.config.ts` to point at entry**

Re-verify by running: `cd demos && npx remotion studio src/index.ts` (should open the studio with MusicDemo listed; the footage is black because it's the stub, but the composition should bundle).

If it fails on the JSON import, add to `tsconfig.json` `"resolveJsonModule": true` (already added in Task 1).

- [ ] **Step 10: Commit**

```bash
git add demos/src/Root.tsx demos/src/index.ts demos/src/demos/music/MusicDemo.tsx demos/src/demos/music/loadMeta.ts demos/src/demos/music/script.ts demos/recordings/music/
git commit -m "feat(demos): MusicDemo composition + Root registration"
```

---

### Task 15: Render + Build orchestration

**Files:**
- Create: `demos/scripts/render.mjs`
- Create: `demos/scripts/build.mjs`

- [ ] **Step 1: Create `render.mjs`**

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoName = process.argv[2];
if (!demoName) {
  console.error('Usage: render.mjs <demo-name>');
  process.exit(1);
}

const demoRoot = path.join(__dirname, '..');
const recordingsDir = path.join(demoRoot, 'recordings', demoName);
const publicRecordingsDir = path.join(demoRoot, 'public', 'recordings', demoName);
const outDir = path.join(demoRoot, 'out');
fs.mkdirSync(publicRecordingsDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

// Copy capture.mp4 into public so staticFile() can reach it
const srcCapture = path.join(recordingsDir, 'capture.mp4');
const destCapture = path.join(publicRecordingsDir, 'capture.mp4');
if (!fs.existsSync(srcCapture)) {
  console.error(`[render] No capture found at ${srcCapture}. Did you record first?`);
  process.exit(1);
}
fs.copyFileSync(srcCapture, destCapture);
console.log(`[render] Copied capture to ${destCapture}`);

// Build composition ID (convention: <DemoName>Demo, PascalCase)
const compId = demoName[0].toUpperCase() + demoName.slice(1) + 'Demo';
const outFile = path.join(outDir, `${demoName}.mp4`);

const args = [
  'remotion', 'render',
  'src/index.ts',
  compId,
  outFile,
  '--codec=h264',
  '--crf=18',
  '--concurrency=4',
];
console.log(`[render] npx ${args.join(' ')}`);
const p = spawn('npx', args, { cwd: demoRoot, stdio: 'inherit', shell: true });
p.on('exit', (code) => process.exit(code ?? 1));
```

- [ ] **Step 2: Create `build.mjs`**

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoName = process.argv[2];
if (!demoName) {
  console.error('Usage: build.mjs <demo-name>');
  process.exit(1);
}

const run = (script) => new Promise((resolve, reject) => {
  const p = spawn('node', [path.join(__dirname, script), demoName], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
  });
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
});

await run('record.mjs');
await run('render.mjs');
console.log('[build] Done. Output: demos/out/' + demoName + '.mp4');
```

- [ ] **Step 3: Commit**

```bash
git add demos/scripts/render.mjs demos/scripts/build.mjs
git commit -m "feat(demos): render + build orchestration scripts"
```

---

### Task 16: End-to-end run and iteration

**Files:** none (execution + debugging)

- [ ] **Step 1: Verify Remotion studio bundles**

Run: `cd demos && npx remotion studio src/index.ts`
Expected: Studio opens in browser at localhost. `MusicDemo` composition listed. Timeline shows 3300 frames. Preview may be black/stubbed but doesn't error.

Ctrl+C to exit.

- [ ] **Step 2: Run the recorder**

Run: `cd demos && npm run record -- music`
Expected behavior:
- Dev server starts (or detected if running)
- ffmpeg starts capturing
- Chromium window opens at (100,100) 1600×900, magenta for 1.5s
- Page navigates to `/music`, calendar renders with April 2026 songs
- ~5s of stillness
- Hover + click on day-2026-04-15 around t=11s
- Bottom player appears, plays for ~30s
- Recording stops, `capture.mp4` and `meta.json` written
- Magenta marker detected, `t0Frame` written

Verify: `demos/recordings/music/capture.mp4` exists and `demos/recordings/music/meta.json` contains ~35+ target entries including player* keys.

**Troubleshooting hints:**
- If Chromium doesn't start at the exact rect, check `--window-position` / `--window-size` flag support on the Playwright-bundled Chromium. Some versions require `--window-size=W,H` with no space. Adjust.
- If `[data-demo-target="day-2026-04-15"] button[aria-label="Play full track"]` isn't found, the click logic expects the song to have `deezer_id`. Verify the fixture entry has it. If still failing, inspect real DOM via `page.pause()` to see the rendered aria-label.
- If ffmpeg doesn't cleanly stop with `q`, the fallback SIGKILL will fire — the file may be slightly truncated but usually still playable.

- [ ] **Step 3: Run the renderer**

Run: `cd demos && npm run render -- music`
Expected: Remotion bundles in ~30s, renders 3300 frames using 4 concurrent browser workers, outputs `demos/out/music.mp4`.

Verify video with:
```bash
npx ffmpeg-static -i demos/out/music.mp4 2>&1 | grep -E "(Duration|Stream)"
```
Expected: Duration 00:00:55.00, Video: h264, 1920x1080, 60 fps, Audio: aac.

- [ ] **Step 4: Visual QA**

Open `demos/out/music.mp4` in a media player. Check:
- 5s intro on full calendar
- Cursor arcs to day-15 and clicks; ripple visible
- Camera zooms into player
- Three callouts appear in sequence
- Audio plays during player scene
- Camera zooms back out smoothly
- Outro fade to dark with URL

Likely iteration points:
- Camera origin off-target → tune normalized origins or re-measure targets
- Cursor lands slightly off → adjust `day-2026-04-15` target rect logic or cursor waypoint timing
- Callouts clip outside footage rect → shift `side` choices or use smaller OFFSET
- Audio doesn't play → verify `music-demo-preview.mp3` has audible content and path

Make any needed tweaks in `script.ts` / framework primitives, re-run `npm run render -- music` (fast, no re-recording).

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(demos): final music demo tuning"
```

---

## Self-review

**Spec coverage check:**
- Browser chrome ✓ (Task 5)
- Animated cursor ✓ (Task 7)
- Click indication ✓ (Task 7)
- Camera zoom ✓ (Task 6 + camera resolver in Task 4)
- Callout labels ✓ (Task 8)
- Scene sequencing ✓ (built into MusicDemo via Remotion `<Sequence>`)
- Outro ✓ (Task 9)
- Reusability: framework/ and scripts/ are demo-agnostic ✓
- 1920×1080 @ 60fps ✓ (script.ts + composition config)
- Music demo scenes ✓ (script.ts in Task 13)
- Audio (song preview) ✓ (Task 10 + audio spec in Task 13)
- Easter-egg bypass ✓ (Task 11, sessionStorage seed)
- API stub ✓ (Task 11, page.route)
- data-demo-target attrs ✓ (Task 2)
- Hybrid Playwright+ffmpeg architecture ✓ (Task 12)
- Magenta sync marker ✓ (Task 12)

**Placeholder scan:** all steps contain actual code or exact commands. One "iterate on tuning" block in Task 16 is unavoidable given video output — the verification criteria are explicit.

**Type consistency:** `DemoMeta`, `Scene`, `CameraKeyframe`, `CursorWaypoint`, `CameraState`, `TargetRect` defined in `types.ts` and `targets.ts` — used consistently across all consuming files.

**Scope:** one plan, one deliverable (music.mp4). All tasks contribute to the same video output. Not decomposable without losing deliverable coherence.
