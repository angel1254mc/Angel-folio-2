import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface Props {
   at: number;              // scene-relative frame when first key appears
   text: string;
   perKeyFrames: number;    // frames between each keycap lighting up
   position?: 'top-center' | 'bottom-center';
   sceneFrom: number;       // absolute scene start, so useCurrentFrame can be normalized
}

const LIT_FADE = 8;           // frames to animate dim → lit
const TAIL_HOLD = 30;         // frames the full word holds after last key
const TAIL_FADE = 24;         // frames to fade the whole row out

export const KeycapStack: React.FC<Props> = ({
   at,
   text,
   perKeyFrames,
   position = 'top-center',
   sceneFrom,
}) => {
   const frame = useCurrentFrame() - sceneFrom - at;
   const lastKeyFrame = perKeyFrames * (text.length - 1) + LIT_FADE;
   const fadeStart = lastKeyFrame + TAIL_HOLD;
   const fadeEnd = fadeStart + TAIL_FADE;

   if (frame < -2 || frame > fadeEnd + 2) return null;

   const rowOpacity = frame < fadeStart
      ? 1
      : interpolate(frame, [fadeStart, fadeEnd], [1, 0], {
           extrapolateLeft: 'clamp',
           extrapolateRight: 'clamp',
        });

   return (
      <AbsoluteFill
         style={{
            pointerEvents: 'none',
            display: 'flex',
            alignItems: position === 'top-center' ? 'flex-start' : 'flex-end',
            justifyContent: 'center',
            paddingTop: position === 'top-center' ? 80 : 0,
            paddingBottom: position === 'bottom-center' ? 80 : 0,
            opacity: rowOpacity,
         }}
      >
         <div style={{ display: 'flex', gap: 8 }}>
            {text.split('').map((ch, i) => {
               const keyStart = i * perKeyFrames;
               const lit = interpolate(
                  frame,
                  [keyStart, keyStart + LIT_FADE],
                  [0.18, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
               );
               const scale = interpolate(
                  frame,
                  [keyStart, keyStart + 3, keyStart + LIT_FADE],
                  [1, 1.06, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
               );
               return (
                  <div
                     key={i}
                     style={{
                        width: 64,
                        height: 72,
                        borderRadius: 12,
                        background:
                           'linear-gradient(180deg, #2b2b33 0%, #1a1a20 100%)',
                        boxShadow:
                           '0 3px 0 #000, 0 8px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                        color: '#f5f5f7',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontWeight: 600,
                        fontSize: 28,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: lit,
                        transform: `scale(${scale})`,
                     }}
                  >
                     {ch}
                  </div>
               );
            })}
         </div>
      </AbsoluteFill>
   );
};
