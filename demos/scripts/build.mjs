#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const demo = process.argv[2] || 'music';

const run = (script) =>
   new Promise((ok, fail) => {
      const nodeCmd = process.execPath;
      const child = spawn(nodeCmd, [resolve(__dirname, script), demo], {
         cwd: root,
         stdio: 'inherit',
      });
      child.on('exit', (code) => {
         if (code === 0) ok();
         else fail(new Error(`${script} exited ${code}`));
      });
   });

(async () => {
   console.log(`[build] record → render for demo="${demo}"`);
   await run('record.mjs');
   await run('render.mjs');
   console.log(`[build] ✓ out/${demo}.mp4`);
})().catch((err) => {
   console.error(`[build] ${err.message}`);
   process.exit(1);
});
