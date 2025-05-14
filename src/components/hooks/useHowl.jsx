import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
export const useHowl = ({ src, fadeAfter, ...configOptions }) => {
   const howlRef = useRef(null);
   const currPlaying = useRef(null);
   const [loaded, setLoaded] = useState(false);

   useEffect(() => {
      if (!howlRef.current) {
         howlRef.current = new Howl({
            src: [src],
            ...configOptions,
         });
         console.log('Created', src);

         howlRef.current.on('load', () => {
            console.log('Loaded', src);
            setLoaded(true);
         });
      } else {
         if (src && howlRef.current._src !== src) {
            howlRef.current.unload();

            howlRef.current = new Howl({
               src: [src],
               ...configOptions,
            });
            console.log('Source parameter changed', src);
            howlRef.current.on('load', () => {
               console.log('Loaded new source param', src);
               setLoaded(true);
            });
         }
      }
   }, [src, configOptions]);

   useEffect(() => {
      return () => {
         if (howlRef.current) {
            console.log('Unloaded', src);
            howlRef.current.unload();
         }
      };
   }, []);
   // Push some random stuff

   // Turns the howler.play() function into a promise
   const playSound = async () => {
      return new Promise((resolve, reject) => {
         if (src && loaded && howlRef.current) {
            const soundRef = { current: null };
            console.log(howlRef.current);
            howlRef.current._onplay = [
               {
                  id: undefined,
                  fn: () => {
                     console.log('Playing', src);
                     resolve(soundRef.current);
                  },
               },
            ];
            howlRef.current._onplayerror = [
               {
                  id: undefined,
                  fn: () => {
                     reject('Howl not loaded or src not provided');
                  },
               },
            ];
            soundRef.current = howlRef.current.play();
         }
      });
   };

   const fadeSound = async (from, to, duration, soundId) => {
      return new Promise((resolve, reject) => {
         try {
            if (src && loaded && howlRef.current) {
               howlRef.current._onfade = [
                  {
                     id: undefined,
                     fn: () => {
                        resolve();
                     },
                  },
               ];

               howlRef.current.fade(from, to, duration, soundId);
            }
         } catch (err) {
            reject(err);
         }
      });
   };

   const play = async () => {
      if (
         src &&
         loaded &&
         howlRef.current &&
         howlRef.current.state() === 'loaded'
      ) {
         if (currPlaying.current) {
            howlRef.current?.stop(currPlaying.current);
         }
         howlRef.current.volume(0);
         currPlaying.current = await playSound();
         await fadeSound(0, 0.5, 2000, currPlaying.current);

         let closureID = currPlaying.current;
      }
   };

   const end = () => {
      if (src && loaded && howlRef.current && howlRef.current.playing()) {
         howlRef.current?.fade(0.5, 0, 2000, currPlaying.current);
         let closureID = currPlaying.current;
         setTimeout(() => {
            if (closureID === currPlaying.current)
               howlRef.current?.stop(currPlaying.current);
         }, [2000]);
      }
   };

   return {
      play,
      end,
      loaded,
   };
};
