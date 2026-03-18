'use client';
import { faMusic, faGripLines } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultCover from '../../../public/default-music-cover.png';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import usePurpleHover from '../hooks/usePurpleHover';
import { animated } from '@react-spring/web';
import { clampWords } from '../typography/utils';

const SongOfTheDayComponent = () => {
   const [setIsHover, hoverAnimate] = usePurpleHover();
   const [song, setSong] = useState(null);

   useEffect(() => {
      fetch('/api/get-song-of-the-day', { cache: 'no-store' })
         .then((r) => r.json())
         .then((json) => {
            if (json.date) setSong(json);
         })
         .catch(() => {});
   }, []);

   return (
      <animated.div
         onMouseOver={() => setIsHover(true)}
         onMouseOut={() => setIsHover(false)}
         style={hoverAnimate}
         className='w-full h-full flex rounded-md bg-[#101010]'
      >
         <div className='w-16 flex flex-col justify-center items-center h-full border-r-[1px] gap-y-1 border-[#242424]'>
            <FontAwesomeIcon
               icon={faGripLines}
               className='text-3xl text-[#242424]'
            />
            <FontAwesomeIcon
               icon={faMusic}
               className='text-[2rem] text-purple-400'
            />
            <FontAwesomeIcon
               icon={faGripLines}
               className='text-3xl text-[#242424]'
            />
         </div>
         <div className='w-full h-full flex pl-3 pr-2 gap-x-2 items-center'>
            <a
               className='min-w-[7rem] min-h-[7rem]'
               target='_blank'
               rel='noreferrer'
               href={song?.track_url ?? '#'}
            >
               <Image
                  className='w-28 h-28'
                  width={200}
                  height={200}
                  alt={song?.title ?? 'No song picked yet'}
                  src={song?.artwork_url ?? defaultCover}
               />
            </a>
            <div className='flex flex-col gap-y-1 pl-1 flex-wrap min-h-[6rem] justify-center'>
               <a
                  target='_blank'
                  rel='noreferrer'
                  href={song?.track_url ?? '#'}
                  className='text-base font-semibold'
               >
                  {song?.title
                     ? clampWords(song.title, 8)
                     : 'No song picked yet'}
               </a>
               <p className='text-sm'>{song?.artist ?? ''}</p>
               <p className='text-xs font-light'>
                  {song?.album ? clampWords(song.album, 8) : ''}
               </p>
            </div>
         </div>
      </animated.div>
   );
};

export default SongOfTheDayComponent;
