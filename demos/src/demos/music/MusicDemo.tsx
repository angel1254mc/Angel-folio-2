import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { script } from './script';
import { musicMeta } from './loadMeta';
import { BrowserChrome } from '../../framework/BrowserChrome';
import { SiteFootage } from '../../framework/SiteFootage';
import { Cursor } from '../../framework/Cursor';
import { ClickRipple } from '../../framework/ClickRipple';
import { Callout } from '../../framework/Callout';
import { Outro } from '../../framework/Outro';
import { resolveCameraAt } from '../../framework/targets';
import type { Scene } from '../../framework/types';

const FOOTAGE_X = 80;
const FOOTAGE_Y = 56;
const FOOTAGE_W = 1760;
const FOOTAGE_H = 968;
const CHROME_BAR = 44;
const CONTENT_RECT = {
   x: FOOTAGE_X,
   y: FOOTAGE_Y + CHROME_BAR,
   w: FOOTAGE_W,
   h: FOOTAGE_H - CHROME_BAR,
};

const findCurrentScene = (frame: number): Scene | null => {
   for (const s of script.scenes) {
      if (frame >= s.from && frame < s.from + s.duration) return s;
   }
   return null;
};

export const MusicDemo: React.FC = () => {
   const frame = useCurrentFrame();
   const scene = findCurrentScene(frame);

   const camera = scene
      ? resolveCameraAt(frame - scene.from, scene.camera, musicMeta)
      : { scale: 1, originX: 0.5, originY: 0.5 };

   return (
      <AbsoluteFill style={{ background: '#0a0a0c' }}>
         <BrowserChrome
            url={script.chrome.url}
            x={FOOTAGE_X}
            y={FOOTAGE_Y}
            width={FOOTAGE_W}
            height={FOOTAGE_H}
         >
            <SiteFootage
               src={staticFile('recordings/music/capture.mp4')}
               startFrom={musicMeta.t0Frame}
               camera={camera}
               width={FOOTAGE_W}
               height={FOOTAGE_H - CHROME_BAR}
            />
         </BrowserChrome>

         {script.scenes.map((s) => (
            <Sequence
               key={s.id}
               from={s.from}
               durationInFrames={s.duration}
            >
               <SceneOverlays scene={s} camera={camera} />
            </Sequence>
         ))}
      </AbsoluteFill>
   );
};

const SceneOverlays: React.FC<{
   scene: Scene;
   camera: { scale: number; originX: number; originY: number };
}> = ({ scene, camera }) => {
   return (
      <>
         {scene.cursor && (
            <Cursor
               waypoints={scene.cursor}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
               canvas={{ w: 1920, h: 1080 }}
            />
         )}
         {scene.clicks?.map((c) => (
            <ClickRipple
               key={`${scene.id}-${c.at}`}
               at={c.at}
               target={c.target}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
            />
         ))}
         {scene.callouts?.map((c) => (
            <Callout
               key={`${scene.id}-${c.label}`}
               at={c.at}
               until={c.until}
               target={c.target}
               label={c.label}
               side={c.side}
               meta={musicMeta}
               camera={camera}
               footageRect={CONTENT_RECT}
               sceneFrom={scene.from}
            />
         ))}
         {scene.audio && (
            <Audio
               src={staticFile(scene.audio.src.replace(/^\//, ''))}
               volume={scene.audio.volume ?? 1}
            />
         )}
         {scene.outro && <Outro {...scene.outro} sceneFrom={scene.from} />}
      </>
   );
};
