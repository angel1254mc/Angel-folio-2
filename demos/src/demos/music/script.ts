import { DemoScript } from '../../framework/types';

export const script: DemoScript = {
   fps: 60,
   durationInFrames: 3300,
   width: 1920,
   height: 1080,
   recording: 'recordings/music/capture.mp4',
   meta: 'recordings/music/meta.json',
   chrome: { url: 'angel1254.com/music' },
   scenes: [
      {
         id: 'intro',
         from: 0,
         duration: 300,
         camera: [{ at: 0, scale: 1.0, origin: [0.5, 0.45] }],
      },
      {
         id: 'pick-a-day',
         from: 300,
         duration: 540,
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
         duration: 900,
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
            {
               at: 180,
               until: 420,
               target: 'player-artwork',
               label: 'Album art',
               side: 'left',
            },
            {
               at: 240,
               until: 480,
               target: 'player-title',
               label: 'Song + artist',
               side: 'right',
            },
            {
               at: 420,
               until: 660,
               target: 'player-controls',
               label: 'Preview playback',
               side: 'top',
            },
         ],
      },
      {
         id: 'zoom-back-out',
         from: 1740,
         duration: 900,
         camera: [
            { at: 0, scale: 1.7, origin: 'target:player' },
            { at: 300, scale: 1.0, origin: [0.5, 0.45] },
         ],
      },
      {
         id: 'outro',
         from: 2640,
         duration: 660,
         outro: {
            url: 'angel1254.com/music',
            fadeInFrames: 45,
            holdFrames: 555,
            fadeOutFrames: 60,
         },
      },
   ],
};
