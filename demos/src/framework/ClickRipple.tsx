import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DemoMeta } from './types';
import { CameraState, targetCenter } from './targets';

interface Props {
   at: number;
   target: string;
   meta: DemoMeta;
   camera: CameraState;
   footageRect: { x: number; y: number; w: number; h: number };
   sceneFrom: number;
}

const RIPPLE_FRAMES = 22;

export const ClickRipple: React.FC<Props> = ({
   at,
   target,
   meta,
   camera,
   footageRect,
   sceneFrom,
}) => {
   const frame = useCurrentFrame() - sceneFrom;
   const dt = frame - at;
   if (dt < 0 || dt > RIPPLE_FRAMES) return null;

   const rect = meta.targets[target];
   if (!rect) return null;
   const c = targetCenter(rect, meta, camera, footageRect);

   const t = dt / RIPPLE_FRAMES;
   const scale = 0.4 + t * 2.2;
   const opacity = 1 - t;
   const flashOpacity = dt < 4 ? (1 - dt / 4) * 0.25 : 0;

   return (
      <>
         <div
            style={{
               position: 'absolute',
               left: c.x - 40,
               top: c.y - 40,
               width: 80,
               height: 80,
               borderRadius: 40,
               border: '3px solid rgba(255,255,255,0.9)',
               transform: `scale(${scale})`,
               opacity,
               pointerEvents: 'none',
            }}
         />
         {flashOpacity > 0 && (
            <div
               style={{
                  position: 'absolute',
                  left: c.x - 28,
                  top: c.y - 28,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  background: 'rgba(255,255,255,1)',
                  opacity: flashOpacity,
                  pointerEvents: 'none',
               }}
            />
         )}
      </>
   );
};
