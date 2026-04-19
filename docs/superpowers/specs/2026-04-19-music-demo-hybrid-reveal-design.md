# Music Demo — Hybrid Reveal + Slide Outro (Addendum)

Date: 2026-04-19
Status: Draft
Parent spec: [2026-04-18-demo-video-framework-design.md](./2026-04-18-demo-video-framework-design.md)

## Summary

Extends the v1 music demo (single click → bottom player plays → fade-to-dark outro with URL) into a narrative three-beat sequence with an on-screen easter-egg reveal and a slide transition into a clean-brand outro. Music continues across the transition.

## Why

The v1 composition is technically complete (Tasks 1–15 merged) but the ending is generic. The product story is richer: the `/music` feature has a public behavior (30s previews) and an unlocked behavior (full-track playlist via `usePlaylist`) gated by the `playmusic` easter-egg keyword. Surfacing both, plus the transition moment, turns the demo from "here is a calendar" into "here is what happens when you know the secret."

## New narrative (replaces v1 Scene 3+)

1. **Calendar hold** — ~5s on full April 2026 calendar (unchanged from v1).
2. **Preview 1** — cursor arcs to **4/15 Midnight City / M83**, clicks the preview icon, 30s preview begins, plays for **~2s**.
3. **Preview 2** — cursor arcs up to **4/03 Redbone / Childish Gambino**, clicks, M83 crossfades out, Redbone plays for **~2s**.
4. **Typing beat** — cursor pauses. Playwright types `playmusic` with `delay: 120`. Nine keycaps appear top-center, one per keystroke, dim → lit, in sync with the typing. On the final keystroke, `useEasterEgg` flips `unlocked` to true.
5. **Full track** — cursor arcs down-right to **4/19 Live Fast & Die Young / Rick Ross**, clicks. `usePlaylist.playFromDate` loads the full track via `/api/music/full-track`. Built-in 600ms fade-in. Plays into the outro.
6. **Rick Ross hold** — bottom player is on-screen, full track plays for ~40s. No camera movement — camera stayed in place after the player appeared at beat 5.
7. **Slide transition** — page translates left (−100%) while a black-background tagline layer translates in from the right (+100% → 0). Duration ~700ms, cubic-bezier ease-in-out. They cross through the midline.
8. **Tagline hold** — clean brand outro on black: `AngelFolio` large + `angellopez.dev` small uppercase. ~3s.
9. **Audio tail** — Rick Ross continues throughout the slide and most of the tagline hold, fading out in the final ~600ms before the video ends.

Total duration: ~59s (v1 was 55s).

## Non-goals

- Replacing the v1 `<Outro>` primitive. New behavior ships as a separate `<BrandOutro>` so `<Outro>` stays available for other demos.
- Real keyboard event synthesis in Remotion. Keycap overlay is purely visual, synced to Playwright-provided timestamps from `meta.json`.
- Framework extraction. Stays in-repo; roadmap'd for later.
- App-side UI changes to the easter-egg flow. The hook stays silent; all visible feedback is Remotion overlay.

## Architecture changes

### Fixture

`demos/src/demos/music/fixture.json`:
- **Swap** `2026-04-19` from *Ivy / Frank Ocean* → *Live Fast & Die Young / Rick Ross*. `deezer_id` + `track_url` set to the canonical Deezer entry for the track.
- `2026-04-15` Midnight City unchanged.
- `2026-04-03` Redbone unchanged.

### Playwright scenario (`demos/src/demos/music/playwright.mjs`)

**Drop** the sessionStorage preseed:
```js
// REMOVE:
page.addInitScript(() => sessionStorage.setItem('music_ee', '1'))
```
Easter egg must be typed live so keystroke timestamps are real.

**Stub** `/api/music/full-track?deezer_id=…&title=…&artist=…` with `page.route` so Rick Ross resolves deterministically to a local audio file staged under `demos/src/demos/music/audio/` (see below).

**New beat sequence,** each beat timestamped to the recording clock (ms since recording start) and appended to `meta.beats`:

```js
const beats = [];
const markBeat = (type, payload) => beats.push({ type, t: Date.now() - recStartMs, ...payload });

// t≈5s — cursor on 4/15
await hoverAndClick('[data-demo-target="day-2026-04-15"] [data-demo-target="preview-btn"]');
markBeat('preview-start', { target: 'day-2026-04-15' });
await page.waitForTimeout(2000);

// t≈7s — cursor on 4/03
await hoverAndClick('[data-demo-target="day-2026-04-03"] [data-demo-target="preview-btn"]');
markBeat('preview-start', { target: 'day-2026-04-03' });
await page.waitForTimeout(2000);

// t≈9s — type playmusic
await page.waitForTimeout(400);
markBeat('type-start', { text: 'playmusic' });
await page.keyboard.type('playmusic', { delay: 120 });
markBeat('type-end', {});
await page.waitForTimeout(500);

// t≈11s — click Rick Ross
await hoverAndClick('[data-demo-target="day-2026-04-19"] button[aria-label="Play full track"]');
markBeat('fulltrack-start', { target: 'day-2026-04-19' });
await page.waitForTimeout(10000); // full-track playback hold

// Recording continues — stop is triggered by total scene budget
```

`meta.beats` is written alongside the existing target rects, giving Remotion the frame offsets for audio swaps, keycaps, and transition start.

### `data-demo-target` additions

The calendar cells already have `data-demo-target="day-YYYY-MM-DD"` wrappers (from v1 Task 2). Add:
- `data-demo-target="preview-btn"` on the 30s preview icon inside each cell (touching `AudioIcons.jsx` — already modified in the uncommitted working copy).

No other app-side changes.

### Audio staging

New directory: `demos/src/demos/music/audio/`

- `preview-01-midnight-city.mp3` (2.5s clip, M83 preview)
- `preview-02-redbone.mp3` (2.5s clip, Childish Gambino preview)
- `full-rick-ross.mp3` (~44s clip, covers from `fulltrack-start` at frame 900 through video end at frame 3522)

Preview clips (M83, Redbone) come from Deezer's 30s preview URLs, trimmed to the 2.5s window with ffmpeg. The Rick Ross clip is sourced from whatever `/api/music/full-track` returns in production (the same route the app hits when unlocked) — the Playwright stub serves this pre-recorded file so renders are deterministic. All three files are git-tracked (small, demo-specific, reproducibility > repo slimness).

### Remotion composition (`demos/src/demos/music/MusicDemo.tsx`)

Replace the single `<Audio>` element with three stacked `<Audio>` elements, each wrapped in a `<Sequence>` anchored to the `beats` entry from `meta.json`:

```tsx
<Sequence from={beatFrame('preview-start', 'day-2026-04-15')} durationInFrames={120}>
  <Audio src={staticFile('preview-01-midnight-city.mp3')} volume={fadeEnvelope} />
</Sequence>
<Sequence from={beatFrame('preview-start', 'day-2026-04-03')} durationInFrames={120}>
  <Audio src={staticFile('preview-02-redbone.mp3')} volume={fadeEnvelope} />
</Sequence>
<Sequence from={beatFrame('fulltrack-start')} durationInFrames={untilEnd}>
  <Audio src={staticFile('full-rick-ross.mp3')} volume={tailFadeEnvelope} />
</Sequence>
```

`volume` uses `interpolate(frame, [startFrame, startFrame+12, endFrame-36, endFrame], [0, 1, 1, 0])` for crossfades matching the app's 600ms native fade.

### New framework primitives

Both go under `demos/src/framework/`. Both demo-agnostic; reusable for future demos.

#### `<KeycapStack>`

Props:
```ts
{
  text: string;            // 'playmusic'
  startFrame: number;      // maps to beats['type-start'].t
  perKeyFrames: number;    // = round(60 * delay_ms / 1000) — 7 for 120ms delay
  position?: 'top-center' | 'bottom-center';  // default top-center
}
```

Renders `text.length` keycap elements horizontally. Each keycap interpolates from `dim` (opacity 0.2) to `lit` (opacity 1, subtle pop scale 1→1.06→1) over 8 frames, starting at `startFrame + i*perKeyFrames`. Entire row fades out 30 frames after the last key.

Styling: rounded dark keycaps with inset shadow and subtle bevel (matches the mockup the user approved).

#### `<BrandOutro>` — replaces the transition + final tagline

Props:
```ts
{
  startFrame: number;      // when slide begins
  slideFrames: number;     // default 42 (~700ms at 60fps)
  holdFrames: number;      // default 180 (3s of tagline before fade)
  brand: string;           // 'AngelFolio'
  url: string;             // 'angellopez.dev'
  siteLayer: ReactNode;    // the composited site footage + overlays to slide out
}
```

Behavior:
- Frames `[0, slideFrames)` relative to `startFrame`: `siteLayer` translates `translateX(0 → -100%)`; tagline panel translates `translateX(100% → 0)`. Both use `cubic-bezier(0.7, 0, 0.3, 1)` via `interpolate` with easing.
- Frames `[slideFrames, slideFrames + holdFrames)`: tagline is settled at 0; `siteLayer` fully off-frame.
- Tagline panel is full-frame black with vertically-centered `brand` (52px, 700 weight, -1.5px tracking, `#fff`) and `url` (13px, 0.4em tracking, uppercase, `#9a9aa8`), ~18px apart.

`<BrandOutro>` wraps (does not replace) everything else in the composition — `MusicDemo` passes its full site-layer JSX as `siteLayer`.

### Audio–video sync

The slide begins at `startFrame = beatFrame('fulltrack-start') + RICK_ROSS_HOLD_FRAMES` where `RICK_ROSS_HOLD_FRAMES = 2400` (40s at 60fps). Audio continues uninterrupted through the slide because the Rick Ross `<Audio>` sequence runs past the slide into the tagline hold and only envelopes off in the last ~36 frames.

## Timing budget (60fps, approximate)

| Frame | Time | Beat |
|---|---|---|
| 0 | 0s | Magenta marker (Playwright) |
| 300 | 5s | Calendar hold begins |
| 540 | 9s | Click 4/15 — preview 1 audio starts |
| 660 | 11s | Click 4/03 — preview 2 starts (crossfade) |
| 780 | 13s | Typing starts, keycap 0 appears |
| 843 | 14.05s | Keycap 8 (last) appears, unlock |
| 900 | 15s | Click 4/19 — Rick Ross full track starts |
| 3300 | 55s | Slide begins (40s Rick Ross hold) |
| 3342 | 55.7s | Slide complete, tagline visible |
| 3486 | 58.1s | Audio begins 600ms fade |
| 3522 | 58.7s | Video ends |

Exact frames drop out of Playwright's `beats` rather than being hardcoded — this table is just a sanity check.

## Testing / QA

Same pattern as v1 Task 16:
1. Run `npm run record -- music` — verify `capture.mp4` and `meta.json` land, and `meta.beats` contains 5 entries (`preview-start` × 2, `type-start`, `type-end`, `fulltrack-start`) with sane timestamps.
2. Run `npm run render -- music` — verify `out/music.mp4` plays cleanly.
3. Visual QA checklist:
   - Keycaps appear in rhythm with the typing; none clipped.
   - M83 → Redbone crossfade is audible, ~600ms.
   - Rick Ross full-track is clearly audible and correct.
   - Slide is 700ms, cross-feels-kinetic.
   - Tagline is centered, readable, no flash/pop.
   - Audio fades cleanly in the final 600ms.

## File changes summary

**Modified:**
- `demos/src/demos/music/fixture.json` (swap 4/19)
- `demos/src/demos/music/playwright.mjs` (drop preseed, add beats sequence)
- `demos/src/demos/music/MusicDemo.tsx` (3-audio swap, adopt `<BrandOutro>` + `<KeycapStack>`)
- `src/components/icons/AudioIcons.jsx` (add `data-demo-target="preview-btn"` — already in working copy)

**New:**
- `demos/src/framework/KeycapStack.tsx`
- `demos/src/framework/BrandOutro.tsx`
- `demos/src/demos/music/audio/preview-01-midnight-city.mp3`
- `demos/src/demos/music/audio/preview-02-redbone.mp3`
- `demos/src/demos/music/audio/full-rick-ross.mp3`

**Unchanged:**
- Existing framework primitives (`BrowserChrome`, `SiteFootage`, `Cursor`, `ClickRipple`, `Callout`, `Outro`).
- Recording scripts (`record.mjs`, `render.mjs`, `build.mjs`, `detect-marker.mjs`).
- `loadMeta.ts` (schema is already open to additional keys).

## Open questions

None. All design choices confirmed:
- Hybrid three-song flow with live `playmusic` typing — confirmed.
- Keycap stack top-center — confirmed.
- Horizontal-swap slide transition — confirmed.
- Clean-brand tagline (`AngelFolio` + `angellopez.dev`) — confirmed.
- Song/day assignments: 4/15 M83, 4/03 Redbone, 4/19 Rick Ross — confirmed.
- ~65s total duration — confirmed.
