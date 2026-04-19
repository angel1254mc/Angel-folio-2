import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';

interface Props {
   url: string;
   fadeInFrames: number;
   holdFrames: number;
   fadeOutFrames: number;
   sceneFrom: number;
}

export const Outro: React.FC<Props> = ({
   url,
   fadeInFrames,
   holdFrames,
   fadeOutFrames,
   sceneFrom,
}) => {
   const frame = useCurrentFrame() - sceneFrom;
   const total = fadeInFrames + holdFrames + fadeOutFrames;
   if (frame < 0 || frame > total) return null;

   const bgOpacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
      extrapolateRight: 'clamp',
   });
   const textOpacity = Math.min(
      interpolate(
         frame,
         [fadeInFrames * 0.6, fadeInFrames + 20],
         [0, 1],
         { extrapolateRight: 'clamp' }
      ),
      interpolate(
         frame,
         [fadeInFrames + holdFrames, fadeInFrames + holdFrames + fadeOutFrames],
         [1, 0],
         { extrapolateLeft: 'clamp' }
      )
   );

   return (
      <AbsoluteFill style={{ background: `rgba(5,5,7,${bgOpacity})` }}>
         <div
            style={{
               position: 'absolute',
               inset: 0,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               opacity: textOpacity,
            }}
         >
            <div
               style={{
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  fontSize: 64,
                  fontWeight: 300,
                  letterSpacing: 4,
                  color: '#f2f2f4',
               }}
            >
               {url}
            </div>
         </div>
      </AbsoluteFill>
   );
};
