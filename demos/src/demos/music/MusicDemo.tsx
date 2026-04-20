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
import { KeycapStack } from '../../framework/KeycapStack';
import { BrandOutro } from '../../framework/BrandOutro';
import { resolveCameraAt } from '../../framework/targets';
import type { Scene, AudioSpec } from '../../framework/types';

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

   const outroScene = script.scenes.find((s) => s.brandOutro);

   const siteLayer = (
      <>
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

         {script.scenes
            .filter((s) => !s.brandOutro)
            .map((s) => (
               <Sequence
                  key={s.id}
                  from={s.from}
                  durationInFrames={s.duration}
               >
                  <SceneOverlays scene={s} camera={camera} />
               </Sequence>
            ))}
      </>
   );

   return (
      <AbsoluteFill style={{ background: '#0a0a0c' }}>
         {outroScene?.brandOutro ? (
            <Sequence
               from={outroScene.from}
               durationInFrames={outroScene.duration}
            >
               <BrandOutro
                  at={outroScene.brandOutro.at}
                  slideFrames={outroScene.brandOutro.slideFrames}
                  holdFrames={outroScene.brandOutro.holdFrames}
                  brand={outroScene.brandOutro.brand}
                  url={outroScene.brandOutro.url}
                  sceneFrom={outroScene.from}
                  siteLayer={siteLayer}
               />
            </Sequence>
         ) : null}
         {outroScene ? (
            <Sequence from={0} durationInFrames={outroScene.from}>
               {siteLayer}
            </Sequence>
         ) : (
            siteLayer
         )}
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
         {scene.audio && <ScheduledAudio spec={scene.audio} sceneFrom={scene.from} />}
         {scene.audios?.map((a, i) => (
            <ScheduledAudio key={`${scene.id}-audio-${i}`} spec={a} sceneFrom={scene.from} />
         ))}
         {scene.keycap && (
            <KeycapStack
               at={scene.keycap.at}
               text={scene.keycap.text}
               perKeyFrames={scene.keycap.perKeyFrames}
               position={scene.keycap.position}
               sceneFrom={scene.from}
            />
         )}
         {scene.outro && <Outro {...scene.outro} sceneFrom={scene.from} />}
      </>
   );
};

const ScheduledAudio: React.FC<{ spec: AudioSpec; sceneFrom: number }> = ({
   spec,
   sceneFrom,
}) => {
   const at = spec.at ?? 0;
   const dur = spec.durationInFrames;
   const frame = useCurrentFrame() - sceneFrom;
   const inWindow = frame >= at && (dur == null || frame < at + dur);

   const relative = frame - at;
   const fadeIn = spec.fadeInFrames ?? 0;
   const fadeOut = spec.fadeOutFrames ?? 0;
   const base = spec.volume ?? 1;

   let vol = base;
   if (fadeIn > 0 && relative < fadeIn) {
      vol = base * (relative / fadeIn);
   }
   if (dur != null && fadeOut > 0 && relative > dur - fadeOut) {
      vol = base * Math.max(0, (dur - relative) / fadeOut);
   }

   if (!inWindow) return null;
   return (
      <Sequence from={at} durationInFrames={dur ?? 999999}>
         <Audio src={staticFile(spec.src.replace(/^\//, ''))} volume={vol} />
      </Sequence>
   );
};
