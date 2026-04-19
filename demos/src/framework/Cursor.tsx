import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CursorWaypoint, DemoMeta } from './types';
import { CameraState, targetCenter } from './targets';
import { springInterpolate } from './timing';

interface Props {
   waypoints: CursorWaypoint[];
   meta: DemoMeta;
   camera: CameraState;
   footageRect: { x: number; y: number; w: number; h: number };
   sceneFrom: number;
   canvas: { w: number; h: number };
}

const resolveWaypoint = (
   wp: CursorWaypoint,
   meta: DemoMeta,
   camera: CameraState,
   footageRect: { x: number; y: number; w: number; h: number },
   canvas: { w: number; h: number }
): { x: number; y: number; opacity: number } => {
   if (wp.anchor === 'offscreen-right') {
      return { x: canvas.w + 80, y: canvas.h / 2, opacity: 0 };
   }
   if (wp.anchor === 'offscreen-left') {
      return { x: -80, y: canvas.h / 2, opacity: 0 };
   }
   if (wp.anchor === 'center') {
      return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
   }
   if (wp.anchor === 'fade-out') {
      return { x: canvas.w / 2, y: canvas.h / 2, opacity: 0 };
   }
   if (wp.position) {
      return { x: wp.position[0], y: wp.position[1], opacity: 1 };
   }
   if (wp.target) {
      const rect = meta.targets[wp.target];
      if (!rect) return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
      const c = targetCenter(rect, meta, camera, footageRect);
      return { x: c.x, y: c.y, opacity: 1 };
   }
   return { x: canvas.w / 2, y: canvas.h / 2, opacity: 1 };
};

export const Cursor: React.FC<Props> = ({
   waypoints,
   meta,
   camera,
   footageRect,
   sceneFrom,
   canvas,
}) => {
   const absFrame = useCurrentFrame();
   const frame = absFrame - sceneFrom;
   if (waypoints.length === 0) return null;

   let prev = waypoints[0];
   let next = waypoints[0];
   if (frame <= waypoints[0].at) {
      prev = next = waypoints[0];
   } else if (frame >= waypoints[waypoints.length - 1].at) {
      prev = next = waypoints[waypoints.length - 1];
   } else {
      for (let i = 0; i < waypoints.length - 1; i++) {
         if (frame >= waypoints[i].at && frame <= waypoints[i + 1].at) {
            prev = waypoints[i];
            next = waypoints[i + 1];
            break;
         }
      }
   }

   const a = resolveWaypoint(prev, meta, camera, footageRect, canvas);
   const b = resolveWaypoint(next, meta, camera, footageRect, canvas);
   const durationFrames = Math.max(1, next.at - prev.at);

   const x = springInterpolate(frame, a.x, b.x, prev.at, durationFrames);
   const y = springInterpolate(frame, a.y, b.y, prev.at, durationFrames);
   const opacity = springInterpolate(
      frame,
      a.opacity,
      b.opacity,
      prev.at,
      durationFrames
   );

   return (
      <svg
         width={44}
         height={52}
         viewBox='0 0 44 52'
         style={{
            position: 'absolute',
            left: x - 6,
            top: y - 2,
            opacity,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
            pointerEvents: 'none',
         }}
      >
         <path
            d='M5 3 L5 36 L14 28 L19 40 L24 38 L19 27 L30 26 Z'
            fill='#ffffff'
            stroke='#000000'
            strokeWidth='1.4'
            strokeLinejoin='round'
         />
      </svg>
   );
};
