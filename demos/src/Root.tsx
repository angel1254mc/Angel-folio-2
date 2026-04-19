import React from 'react';
import { Composition } from 'remotion';
import { MusicDemo } from './demos/music/MusicDemo';
import { script as musicScript } from './demos/music/script';

export const RemotionRoot: React.FC = () => {
   return (
      <>
         <Composition
            id='MusicDemo'
            component={MusicDemo}
            fps={musicScript.fps}
            durationInFrames={musicScript.durationInFrames}
            width={musicScript.width}
            height={musicScript.height}
         />
      </>
   );
};
