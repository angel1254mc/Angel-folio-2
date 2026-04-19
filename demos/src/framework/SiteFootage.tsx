import React from 'react';
import { OffthreadVideo } from 'remotion';
import { CameraState } from './targets';

interface Props {
   src: string;
   startFrom: number;
   camera: CameraState;
   width: number;
   height: number;
}

export const SiteFootage: React.FC<Props> = ({
   src,
   startFrom,
   camera,
   width,
   height,
}) => {
   return (
      <div
         style={{
            position: 'absolute',
            inset: 0,
            width,
            height,
            overflow: 'hidden',
         }}
      >
         <div
            style={{
               width: '100%',
               height: '100%',
               transform: `scale(${camera.scale})`,
               transformOrigin: `${camera.originX * 100}% ${camera.originY * 100}%`,
               willChange: 'transform',
            }}
         >
            <OffthreadVideo
               src={src}
               startFrom={startFrom}
               style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
               }}
               muted
            />
         </div>
      </div>
   );
};
