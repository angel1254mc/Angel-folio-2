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
   await page.route('**/api/music*', (route) =>
      route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(fixture),
      })
   );

   await page.addInitScript(() => {
      try {
         sessionStorage.setItem('music_ee', '1');
      } catch {}
   });

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

   // Scene 1 (intro) — ~5s still
   await page.waitForTimeout(5000);

   // Scene 2 (pick a day) — Cursor animates toward target in overlay.
   // Give it ~6s to arrive, then hover + click.
   await page.waitForTimeout(5800);

   await page.hover('[data-demo-target="day-2026-04-15"]');
   await page.waitForTimeout(500);
   const playBtn = page.locator(
      '[data-demo-target="day-2026-04-15"] button[aria-label="Play full track"]'
   );
   await playBtn.click({ force: true });

   // Scenes 3+4 — let player run through show/zoom-out
   await page.waitForTimeout(32000);
}
