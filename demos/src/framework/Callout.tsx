import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { DemoMeta } from './types';
import { CameraState, projectTargetToCanvas } from './targets';

interface Props {
   at: number;
   until: number;
   target: string;
   label: string;
   side: 'top' | 'right' | 'bottom' | 'left';
   meta: DemoMeta;
   camera: CameraState;
   footageRect: { x: number; y: number; w: number; h: number };
   sceneFrom: number;
}

const FADE_FRAMES = 14;
const OFFSET = 90;

export const Callout: React.FC<Props> = ({
   at,
   until,
   target,
   label,
   side,
   meta,
   camera,
   footageRect,
   sceneFrom,
}) => {
   const frame = useCurrentFrame() - sceneFrom;
   if (frame < at || frame > until) return null;

   const rect = meta.targets[target];
   if (!rect) return null;
   const projected = projectTargetToCanvas(rect, meta, camera, footageRect);
   const tx = projected.x + projected.w / 2;
   const ty = projected.y + projected.h / 2;

   const inT = interpolate(frame, [at, at + FADE_FRAMES], [0, 1], {
      extrapolateRight: 'clamp',
   });
   const outT = interpolate(
      frame,
      [until - FADE_FRAMES, until],
      [1, 0],
      { extrapolateLeft: 'clamp' }
   );
   const opacity = Math.min(inT, outT);

   let labelX = tx;
   let labelY = ty;
   let arrowDX = 0;
   let arrowDY = 0;
   switch (side) {
      case 'top':
         labelY -= OFFSET;
         arrowDY = -OFFSET;
         break;
      case 'bottom':
         labelY += OFFSET;
         arrowDY = OFFSET;
         break;
      case 'left':
         labelX -= OFFSET;
         arrowDX = -OFFSET;
         break;
      case 'right':
         labelX += OFFSET;
         arrowDX = OFFSET;
         break;
   }

   const slideIn = interpolate(frame, [at, at + FADE_FRAMES], [0.9, 1], {
      extrapolateRight: 'clamp',
   });

   return (
      <>
         <svg
            style={{
               position: 'absolute',
               left: 0,
               top: 0,
               width: '100%',
               height: '100%',
               pointerEvents: 'none',
               opacity,
            }}
         >
            <line
               x1={tx}
               y1={ty}
               x2={tx + arrowDX * 0.55}
               y2={ty + arrowDY * 0.55}
               stroke='rgba(255,255,255,0.85)'
               strokeWidth='2'
               strokeLinecap='round'
            />
            <circle
               cx={tx}
               cy={ty}
               r='5'
               fill='rgba(255,255,255,0.95)'
            />
         </svg>
         <div
            style={{
               position: 'absolute',
               left: labelX,
               top: labelY,
               transform: `translate(-50%, -50%) scale(${slideIn})`,
               opacity,
               padding: '10px 18px',
               background: 'rgba(255,255,255,0.97)',
               color: '#111',
               borderRadius: 999,
               fontFamily: 'ui-sans-serif, system-ui, sans-serif',
               fontSize: 18,
               fontWeight: 600,
               whiteSpace: 'nowrap',
               boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
               pointerEvents: 'none',
            }}
         >
            {label}
         </div>
      </>
   );
};
