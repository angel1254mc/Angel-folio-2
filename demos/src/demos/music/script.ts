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
               fadeOutFrames: 36,
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
