// Music demo Playwright scenario. Imported by scripts/record.mjs.
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

export function targetsToMeasure() {
   const days = [];
   for (let d = 1; d <= 30; d++) {
      const dd = String(d).padStart(2, '0');
      days.push(`day-2026-04-${dd}`);
   }
   return [
      ...days,
      'player',
      'player-artwork',
      'player-title',
      'player-controls',
      'player-info',
   ];
}

export async function scenario(page) {
   await page.waitForSelector('[data-demo-target="day-2026-04-15"]', {
      timeout: 15000,
   });

   // Scene 1 (intro) — 5s still on the calendar
   await page.waitForTimeout(5000);

   // Scene 2 — Preview 1 (M83 on 4/15)
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
   await page.evaluate(() => document.body.focus());
   await page.keyboard.type('playmusic', { delay: 120 });

   // Small pause so the unlock state propagates through React
   await page.waitForTimeout(500);

   // Scene 4 — Rick Ross full track (4/19)
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
