'use client';
import { faMusic, faGripLines } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultCover from '../../../public/default-music-cover.png';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import usePurpleHover from '../hooks/usePurpleHover';
import useAudioPreview from '../hooks/useAudioPreview';
import { animated } from '@react-spring/web';
import { clampWords } from '../typography/utils';

const SongOfTheDaySkeleton = () => (
   <div className='w-full h-full flex pl-3 pr-2 gap-x-2 items-center animate-pulse'>
      <div className='min-w-[7rem] min-h-[7rem] w-28 h-28 rounded bg-[#1a1a1a]' />
      <div className='flex flex-col gap-y-2 pl-1 min-h-[6rem] justify-center'>
         <div className='h-4 w-32 rounded bg-[#1a1a1a]' />
         <div className='h-3 w-24 rounded bg-[#1a1a1a]' />
         <div className='h-3 w-20 rounded bg-[#1a1a1a]' />
      </div>
   </div>
);

const PlayIcon = () => (
   <svg
      className='w-8 h-8 text-white'
      fill='currentColor'
      viewBox='0 0 24 24'
   >
      <path d='M8 5v14l11-7z' />
   </svg>
);

const PauseIcon = () => (
   <svg
      className='w-8 h-8 text-white'
      fill='currentColor'
      viewBox='0 0 24 24'
   >
      <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
   </svg>
);

const SongOfTheDayComponent = () => {
   const [setIsHover, hoverAnimate] = usePurpleHover();
   const { preload, toggle, playing } = useAudioPreview();
   const [song, setSong] = useState(null);
   const [loading, setLoading] = useState(true);
   const [hovering, setHovering] = useState(false);

   const hasPreview = !!song?.preview_url;

   const safeTrackUrl =
      song?.track_url && /^https?:\/\//i.test(song.track_url)
         ? song.track_url
         : '#';

   useEffect(() => {
      fetch('/api/get-song-of-the-day', { cache: 'no-store' })
         .then((r) => r.json())
         .then((json) => {
            if (json.date) {
               setSong(json);
               if (json.preview_url) preload(json.preview_url);
            }
         })
         .catch((err) => console.error('SongOfTheDay fetch failed', err))
         .finally(() => setLoading(false));
   }, []);

   return (
      <animated.div
         onMouseMove={() => {
            setIsHover(true);
            setHovering(true);
         }}
         onMouseLeave={() => {
            setIsHover(false);
            setHovering(false);
         }}
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
         {loading ? (
            <SongOfTheDaySkeleton />
         ) : (
            <div className='w-full h-full flex pl-3 pr-2 gap-x-2 items-center'>
               <div className='relative min-w-[7rem] min-h-[7rem]'>
                  <a target='_blank' rel='noreferrer' href={safeTrackUrl}>
                     <Image
                        className='w-28 h-28'
                        width={200}
                        height={200}
                        alt={song?.title ?? 'No song picked yet'}
                        src={song?.artwork_url ?? defaultCover}
                     />
                  </a>
                  {hasPreview && (
                     <button
                        onClick={(e) => {
                           e.preventDefault();
                           toggle(song.preview_url);
                        }}
                        className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                           hovering || playing ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-label={playing ? 'Pause preview' : 'Play preview'}
                     >
                        {playing ? <PauseIcon /> : <PlayIcon />}
                     </button>
                  )}
               </div>
               <div className='flex flex-col gap-y-1 pl-1 flex-wrap min-h-[6rem] justify-center'>
                  <a
                     target='_blank'
                     rel='noreferrer'
                     href={safeTrackUrl}
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
         )}
      </animated.div>
   );
};

export default SongOfTheDayComponent;
