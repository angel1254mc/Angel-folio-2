#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const demo = process.argv[2] || 'music';
const compositionId = demo === 'music' ? 'MusicDemo' : demo;

const captureSrc = resolve(root, 'recordings', demo, 'capture.mp4');
const metaSrc = resolve(root, 'recordings', demo, 'meta.json');
const publicDir = resolve(root, 'public', 'recordings', demo);
const captureDst = resolve(publicDir, 'capture.mp4');

if (!existsSync(captureSrc)) {
   console.error(`[render] missing ${captureSrc} — run record first`);
   process.exit(1);
}
if (!existsSync(metaSrc)) {
   console.error(`[render] missing ${metaSrc} — run record first`);
   process.exit(1);
}

mkdirSync(publicDir, { recursive: true });
copyFileSync(captureSrc, captureDst);
console.log(`[render] staged capture.mp4 → public/recordings/${demo}/`);

const outDir = resolve(root, 'out');
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, `${demo}.mp4`);

const args = [
   'remotion',
   'render',
   'src/index.ts',
   compositionId,
   outFile,
   '--codec=h264',
   '--crf=18',
   '--concurrency=4',
   '--pixel-format=yuv420p',
];

console.log(`[render] npx ${args.join(' ')}`);
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npxCmd, args, { cwd: root, stdio: 'inherit', shell: false });

child.on('exit', (code) => {
   if (code !== 0) {
      console.error(`[render] remotion exited ${code}`);
      process.exit(code ?? 1);
   }
   console.log(`[render] ✓ ${outFile}`);
});
