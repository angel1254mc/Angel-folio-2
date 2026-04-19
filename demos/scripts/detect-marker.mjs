import { spawn } from 'node:child_process';
import ffmpegPkg from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ffmpegPath = typeof ffmpegPkg === 'string' ? ffmpegPkg : ffmpegPkg.default;

export async function detectMarkerFrame(videoPath) {
   const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-marker-'));
   await new Promise((resolve, reject) => {
      const p = spawn(
         ffmpegPath,
         [
            '-hide_banner',
            '-loglevel',
            'error',
            '-i',
            videoPath,
            '-t',
            '5',
            '-vf',
            'fps=60,scale=64:36',
            '-y',
            path.join(tmp, 'f_%04d.png'),
         ],
         { stdio: 'ignore' }
      );
      p.on('exit', (code) =>
         code === 0 ? resolve() : reject(new Error('ffmpeg sample failed'))
      );
   });

   const files = fs
      .readdirSync(tmp)
      .filter((f) => f.endsWith('.png'))
      .sort();
   for (let i = 0; i < files.length; i++) {
      const file = path.join(tmp, files[i]);
      const rgb = await new Promise((resolve, reject) => {
         const chunks = [];
         const p = spawn(
            ffmpegPath,
            [
               '-hide_banner',
               '-loglevel',
               'error',
               '-i',
               file,
               '-f',
               'rawvideo',
               '-pix_fmt',
               'rgb24',
               '-',
            ],
            { stdio: ['ignore', 'pipe', 'ignore'] }
         );
         p.stdout.on('data', (c) => chunks.push(c));
         p.on('exit', (code) =>
            code === 0
               ? resolve(Buffer.concat(chunks))
               : reject(new Error('ffmpeg decode failed'))
         );
      });

      let r = 0,
         g = 0,
         b = 0;
      const pixels = rgb.length / 3;
      for (let p = 0; p < rgb.length; p += 3) {
         r += rgb[p];
         g += rgb[p + 1];
         b += rgb[p + 2];
      }
      r /= pixels;
      g /= pixels;
      b /= pixels;

      const isMagenta = r > 200 && b > 200 && g < 60;
      if (!isMagenta) {
         fs.rmSync(tmp, { recursive: true, force: true });
         return i;
      }
   }
   fs.rmSync(tmp, { recursive: true, force: true });
   return 0;
}
