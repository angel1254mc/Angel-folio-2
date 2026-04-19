#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpegPkg from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { detectMarkerFrame } from './detect-marker.mjs';

const ffmpegPath = typeof ffmpegPkg === 'string' ? ffmpegPkg : ffmpegPkg.default;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoName = process.argv[2];
if (!demoName) {
   console.error('Usage: record.mjs <demo-name>');
   process.exit(1);
}

const demoDir = path.join(__dirname, '..', 'src', 'demos', demoName);
const scenarioModule = await import(
   pathToFileURL(path.join(demoDir, 'playwright.mjs')).href
);
const { config, setup, scenario, targetsToMeasure } = scenarioModule;

const recordingsDir = path.join(__dirname, '..', 'recordings', demoName);
fs.mkdirSync(recordingsDir, { recursive: true });
const capturePath = path.join(recordingsDir, 'capture.mp4');
const metaPath = path.join(recordingsDir, 'meta.json');

async function pingLocalhost() {
   return new Promise((resolve) => {
      const req = http.request(
         {
            host: 'localhost',
            port: 3000,
            method: 'HEAD',
            path: '/',
            timeout: 800,
         },
         (res) => {
            resolve(true);
            res.destroy();
         }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
         req.destroy();
         resolve(false);
      });
      req.end();
   });
}

let devServer = null;
if (!(await pingLocalhost())) {
   console.log('[record] Starting Next.js dev server...');
   devServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
   });
   devServer.stdout?.on('data', () => {});
   devServer.stderr?.on('data', () => {});
   const start = Date.now();
   while (Date.now() - start < 90000) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await pingLocalhost()) break;
   }
   if (!(await pingLocalhost())) {
      console.error('[record] Dev server did not start in time.');
      process.exit(1);
   }
   console.log('[record] Dev server is up.');
}

// Warm up the /music route so the first page load during recording is fast
try {
   await new Promise((resolve) => {
      const req = http.request(
         {
            host: 'localhost',
            port: 3000,
            path: '/music',
            method: 'GET',
            timeout: 20000,
         },
         (res) => {
            res.resume();
            res.on('end', resolve);
            res.on('error', resolve);
         }
      );
      req.on('error', resolve);
      req.on('timeout', () => {
         req.destroy();
         resolve();
      });
      req.end();
   });
} catch {}

const { x, y, w, h } = config.windowRect;
console.log(`[record] Starting ffmpeg capture at ${w}x${h}+${x},${y}`);

const ffmpegArgs = [
   '-y',
   '-f',
   'gdigrab',
   '-framerate',
   '60',
   '-draw_mouse',
   '0',
   '-offset_x',
   String(x),
   '-offset_y',
   String(y),
   '-video_size',
   `${w}x${h}`,
   '-i',
   'desktop',
   '-c:v',
   'libx264',
   '-preset',
   'veryfast',
   '-crf',
   '18',
   '-pix_fmt',
   'yuv420p',
   capturePath,
];
const ffmpeg = spawn(ffmpegPath, ffmpegArgs, {
   stdio: ['pipe', 'inherit', 'inherit'],
});

await new Promise((r) => setTimeout(r, 1500));

console.log('[record] Launching Chromium on magenta marker...');
const MAGENTA_DATA_URL =
   'data:text/html,' +
   encodeURIComponent(
      '<body style="background:#ff00ff;margin:0;width:100vw;height:100vh"></body>'
   );

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

await page.waitForTimeout(1500);

await setup(page);

await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(500);

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

// Measure player targets after they appear during the scenario
const playerMeasureTimer = setTimeout(async () => {
   try {
      await page.waitForSelector('[data-demo-target="player"]', {
         timeout: 18000,
      });
      await page.waitForTimeout(600);
      const playerRects = await page.evaluate(() => {
         const out = {};
         for (const name of [
            'player',
            'player-artwork',
            'player-title',
            'player-controls',
            'player-info',
         ]) {
            const el = document.querySelector(`[data-demo-target="${name}"]`);
            if (el) {
               const r = el.getBoundingClientRect();
               out[name] = { x: r.x, y: r.y, w: r.width, h: r.height };
            }
         }
         return out;
      });
      Object.assign(targetRects, playerRects);
      console.log(
         '[record] Measured player targets:',
         Object.keys(playerRects).join(', ')
      );
   } catch (e) {
      console.warn('[record] Could not measure player targets:', e.message);
   }
}, 13000);

await scenario(page);
clearTimeout(playerMeasureTimer);

console.log('[record] Scenario done. Stopping ffmpeg...');
try {
   await browser.close();
} catch {}

try {
   ffmpeg.stdin.write('q');
} catch {}
await new Promise((resolve) => {
   const onExit = () => resolve();
   ffmpeg.on('exit', onExit);
   setTimeout(() => {
      try {
         ffmpeg.kill('SIGKILL');
      } catch {}
      resolve();
   }, 8000);
});

if (devServer) {
   console.log('[record] Stopping dev server...');
   try {
      // On Windows kill whole tree
      spawn('taskkill', ['/pid', String(devServer.pid), '/F', '/T'], {
         shell: true,
         stdio: 'ignore',
      });
   } catch {
      try {
         devServer.kill('SIGKILL');
      } catch {}
   }
}

console.log('[record] Detecting magenta marker...');
const t0Frame = await detectMarkerFrame(capturePath);
console.log(`[record] t0Frame = ${t0Frame}`);

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
process.exit(0);
