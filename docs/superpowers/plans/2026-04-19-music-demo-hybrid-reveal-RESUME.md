# Resume Prompt — Music Demo Hybrid Reveal

**Last touched:** 2026-04-20 (paused before Task 9 execution)
**Branch:** `feat/music-easter-egg` (in `C:\Users\angel\Desktop\Angel-folio-2`)
**Plan:** `docs/superpowers/plans/2026-04-19-music-demo-hybrid-reveal.md`
**Spec:** `docs/superpowers/specs/2026-04-19-music-demo-hybrid-reveal-design.md`

## What's done (Tasks 1–8 all committed)

| Task | What | Commit |
|---|---|---|
| 1 | Swap 4/19 fixture → Rick Ross (deezer_id 6817182) | `02889cc` |
| 2 | Stage 3 audio files in `demos/public/audio/` (preview-01, preview-02, rick-ross) | `030dd0c` |
| 3 | Extend framework types (KeycapSpec, BrandOutroSpec, Scene.audios[], AudioSpec fades) | `e6287e4` |
| 4 | `demos/src/framework/KeycapStack.tsx` primitive | `517af22` |
| 5 | `demos/src/framework/BrandOutro.tsx` primitive (horizontal-swap slide) | `84dc028` |
| 6 | Rewrote `demos/src/demos/music/playwright.mjs` (3-beat scenario) | `e785b7e` |
| 7 | Rewrote `demos/src/demos/music/script.ts` (5 scenes, 3522 frames) | `ddd7151` |
| 8 | Updated `demos/src/demos/music/MusicDemo.tsx` (siteLayer extraction + ScheduledAudio) | `9de6c2b` |

Each task went through implementer → spec review → code quality review (subagent-driven-development skill). All passed.

## What's left — Task 9: end-to-end record + render + visual QA

Three concrete steps:

1. **Bundle check:** `cd demos && npx tsc --noEmit` (expect clean).
2. **Record:** `cd demos && npm run record -- music` — boots Next dev server, launches headed Chromium, runs Playwright scenario, captures via ffmpeg gdigrab to `demos/recordings/music/capture.mp4` + `meta.json`. Target runtime ~70-90s.
3. **Render:** `cd demos && npm run render -- music` — bundles Remotion, renders 3522 frames @ 60fps to `demos/out/music.mp4`. Target duration 58.7s.
4. **Visual QA:** User opens `demos/out/music.mp4` and verifies the 9-beat flow against the checklist in the plan (Task 9 Step 4).
5. **Final commit:** Only if tuning changes were needed.

### Known state issue at time of pause

Two stuck Next.js dev servers were killed (PIDs 15416 on :3000, 12100 on :3001). If resuming fresh, check that ports 3000/3001 are free before running the recorder:

```
netstat -ano | grep LISTENING | grep -E ":3000|:3001" || echo "ports free"
```

If they're occupied by leftover node processes, kill them:
```
taskkill //F //PID <pid> //T
```

## How to resume tomorrow

Drop this into Claude:

> Resume the music demo hybrid reveal work. State is in `C:\Users\angel\Desktop\Angel-folio-2\docs\superpowers\plans\2026-04-19-music-demo-hybrid-reveal-RESUME.md`. Read that file first, then use Subagent-Driven Development to execute Task 9 (the last remaining task). Dispatch a sonnet-model implementer to run steps 1–3 (tsc check, `npm run record -- music`, `npm run render -- music`) and report file sizes/durations. After it reports success, I (the user) will do the visual QA in step 4. Platform: Windows bash. Branch: feat/music-easter-egg. Do NOT commit anything in Task 9 unless I ask.

Or more tersely: `continue the music demo plan at task 9`.

## Visual QA checklist (for reference when the user runs it)

Open `demos/out/music.mp4`. Expect roughly:

1. **0–5s** — April 2026 calendar still, no cursor.
2. **5–7s** — cursor arcs in from right, lands on 4/15 (Midnight City). Ripple. M83 clip audible ~2s.
3. **7–9s** — cursor arcs up-left to 4/03 (Redbone). Ripple. Redbone clip audible ~2s.
4. **9–11.4s** — "playmusic" keycaps appear top-center, one per keystroke, then fade.
5. **11.4–15s** — cursor arcs down to 4/19 (Rick Ross). Ripple. Bottom player appears. Camera zooms to player.
6. **15–55s** — Rick Ross plays. No callouts.
7. **55–55.7s** — horizontal-swap slide: page exits left, tagline enters from right.
8. **55.7–58.1s** — "AngelFolio" / "angellopez.dev" tagline on black, music playing.
9. **58.1–58.7s** — 600ms audio fade-out, video ends.

## File map (in `C:\Users\angel\Desktop\Angel-folio-2`)

- `demos/src/framework/KeycapStack.tsx` — typing overlay
- `demos/src/framework/BrandOutro.tsx` — slide + tagline
- `demos/src/framework/types.ts` — extended types
- `demos/src/demos/music/fixture.json` — calendar data (4/19 is Rick Ross now)
- `demos/src/demos/music/playwright.mjs` — scenario
- `demos/src/demos/music/script.ts` — 5 scenes
- `demos/src/demos/music/MusicDemo.tsx` — composition
- `demos/public/audio/music-demo-preview-01.mp3` — M83 2.5s
- `demos/public/audio/music-demo-preview-02.mp3` — Redbone 2.5s
- `demos/public/audio/music-demo-rick-ross.mp3` — Rick Ross 44s

## Tuning notes (if visual QA surfaces issues)

See plan's Task 9 Step 5. Most common:
- Cursor misses cell → `meta.json` didn't capture target rect; increase wait in `playwright.mjs` setup or extend `record.mjs` measurement window.
- Preview audio off-sync → tweak `at` in `script.ts` scene 2 audios.
- Rick Ross audio cuts off → bump `durationInFrames` on scene 4 audio (currently 2600).
- Slide shows blank site → `<Sequence durationInFrames={outroScene.from}>` off-by-one; verify exact match.

Remotion-side tweaks only need `npm run render -- music` re-run (no re-record).
