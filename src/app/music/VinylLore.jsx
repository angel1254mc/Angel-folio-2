'use client';
import { useHowl } from '@/components/hooks/useHowl';
// This function will take in an album object and return a JSX element that displays the album's information in a visually appealing way. The album object will have the following properties:
// albumCoverURL: a string representing the URL of the album cover image
// name: a string representing the name of the album

import Image from 'next/image';
import { useRef } from 'react';
import { useSpring, animated } from 'react-spring';

// artist: a string representing the artist of the album
export const VinylLore = ({
   album_object,
   active,
   setActive,
   onAnimationEnd,
   onAnimationStart,
   index,
}) => {
   const vinylRef = useRef(null);

   const { play, end } = useHowl({
      src: album_object.audioURL,
      html5: true,
      volume: 0.5,
   });

   const retrieveTransformation = (type = 'cover') => {
      if (!vinylRef.current || !window) return [0, 0, 1];
      const { x, y, width, height } = vinylRef.current.getBoundingClientRect();

      if (type === 'cover') {
         return [
            window.innerWidth / 2 - x - width / 2,
            window.innerHeight / 2 - y - height / 2,
            1.5,
         ];
      } else {
         return [width / 2, 0, 1];
      }
   };
   const springValRef = useRef(null);
   const cover = useSpring({
      xys: !active ? [0, 0, 1] : springValRef.current?.cover,
      xys2: !active ? [0, 0, 1] : springValRef.current?.vinyl,
      config: { mass: 5, tension: 500, friction: 80 },
      onRest: () => {
         const stateObj = {
            state: active ? 'active' : 'idle',
            album: album_object,
         };
         onAnimationEnd && onAnimationEnd(stateObj);
      },
      onStart: () => {
         const stateObj = {
            state: active ? 'active' : 'idle',
            album: album_object,
         };
         if (active) {
            play();
         } else {
            end();
         }
         onAnimationStart && onAnimationStart(statifeObj);
      },
   });

   const albumCoverURL = album_object.albumCoverURL;
   const vinylURL =
      album_object.vinylImageURL ?? 'https://i.imgur.com/8UooNED.png';
   return (
      <animated.div
         ref={vinylRef}
         onClick={() => {
            springValRef.current = {
               cover: retrieveTransformation('cover'),
               vinyl: retrieveTransformation('vinyl'),
            };
            setActive((s) => !s);
         }}
         style={{
            transition: 'box-shadow 0.5s',
            boxShadow: `0px 10px ${
               active ? '100px' : '30px'
            } -15px rgba(255, 255, 255, 0.2)`,
            transform: cover.xys.to(
               (x, y, s) => `translateX(${x}px) translateY(${y}px) scale(${s})`
            ),
            zIndex: !active ? 1 : 30,
            userSelect: 'none',
         }}
         className='relative flex items-center justify-center flex-col gap-y-4 w-96 h-96 rounded-lg'
      >
         <animated.div
            style={{
               transform: cover.xys2.to(
                  (x, y, s) =>
                     `translateX(${x}px) translateY(${y}px) scale(${s})`
               ),
            }}
            className='absolute w-96 h-96 flex justify-center items-center'
         >
            <Image
               className=' w-80 h-80 animate-spin'
               src={vinylURL}
               alt='Vinyl Record'
               width={1000}
               height={1000}
            />
         </animated.div>

         <Image
            src={albumCoverURL}
            draggable={false}
            className='absolute w-96 h-96 rounded-lg border-4 border-slate-700'
            alt='Album Cover'
            width={1000}
            height={1000}
         />
      </animated.div>
   );
};
