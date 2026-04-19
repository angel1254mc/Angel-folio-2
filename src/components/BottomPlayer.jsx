'use client';

import React, { useRef, useCallback } from 'react';
import {
   PlayIcon,
   PauseIcon,
   SkipNextIcon,
   SkipPrevIcon,
   ShuffleIcon,
   RepeatIcon,
   RepeatOneIcon,
   SpinnerIcon,
} from './icons/AudioIcons';

const BottomPlayer = ({ playlist }) => {
   const {
      currentSong,
      isPlaying,
      isLoading,
      progress,
      duration,
      currentTime,
      shuffleOn,
      repeatMode,
      togglePlayPause,
      next,
      prev,
      seek,
      toggleShuffle,
      toggleRepeatMode,
      formatTime,
   } = playlist;

   const seekRef = useRef(null);

   const handleSeekChange = useCallback(
      (e) => {
         seek(parseFloat(e.target.value));
      },
      [seek]
   );

   if (!currentSong) return null;

   const repeatIcon =
      repeatMode === 'one' ? (
         <RepeatOneIcon className='w-4 h-4' />
      ) : (
         <RepeatIcon className='w-4 h-4' />
      );

   const seekPercent = (progress * 100).toFixed(2);

   return (
      <div
         data-demo-target='player'
         className='fixed bottom-0 left-0 right-0 z-40 animate-slideUp'
         style={{
            background: 'rgba(21, 21, 21, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
         }}
      >
         {/* Seek bar */}
         <div className='relative w-full h-1 group cursor-pointer'>
            <div className='absolute inset-0 bg-[#303030]' />
            <div
               className='absolute inset-y-0 left-0 bg-purple-500'
               style={{ width: `${seekPercent}%` }}
            />
            <input
               ref={seekRef}
               type='range'
               min='0'
               max='1'
               step='0.001'
               value={progress}
               onChange={handleSeekChange}
               disabled={isLoading}
               className='absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
               aria-label='Seek'
            />
            <div
               className='absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'
               style={{ left: `calc(${seekPercent}% - 6px)` }}
            />
         </div>

         {/* Player content */}
         <div className='flex items-center justify-between px-4 py-3 border-t border-[#303030]'>
            {/* Song info — left */}
            <div
               data-demo-target='player-info'
               className='flex items-center gap-3 min-w-0 flex-1'
            >
               {currentSong.artwork_url ? (
                  <img
                     data-demo-target='player-artwork'
                     src={currentSong.artwork_url}
                     alt=''
                     className='w-12 h-12 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0'
                     style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
               ) : (
                  <div
                     data-demo-target='player-artwork'
                     className='w-12 h-12 rounded bg-[#242424] flex-shrink-0'
                  />
               )}
               <div data-demo-target='player-title' className='min-w-0'>
                  <p className='text-sm font-medium text-white truncate'>
                     {currentSong.title}
                  </p>
                  <p className='text-xs text-gray-400 truncate'>
                     {currentSong.artist}
                  </p>
               </div>
            </div>

            {/* Transport controls — center */}
            <div
               data-demo-target='player-controls'
               className='flex items-center gap-2 sm:gap-3'
            >
               <button
                  type='button'
                  onClick={toggleShuffle}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                     shuffleOn
                        ? 'text-purple-400 hover:text-purple-300'
                        : 'text-gray-500 hover:text-white'
                  }`}
                  aria-label={shuffleOn ? 'Disable shuffle' : 'Enable shuffle'}
               >
                  <ShuffleIcon className='w-4 h-4' />
               </button>
               <button
                  type='button'
                  onClick={prev}
                  className='w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors'
                  aria-label='Previous track'
               >
                  <SkipPrevIcon className='w-5 h-5' />
               </button>
               <button
                  type='button'
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className='w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50'
                  aria-label={isLoading ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
               >
                  {isLoading ? (
                     <SpinnerIcon className='w-5 h-5 text-black' />
                  ) : isPlaying ? (
                     <PauseIcon className='w-5 h-5' />
                  ) : (
                     <PlayIcon className='w-5 h-5' />
                  )}
               </button>
               <button
                  type='button'
                  onClick={next}
                  className='w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors'
                  aria-label='Next track'
               >
                  <SkipNextIcon className='w-5 h-5' />
               </button>
               <button
                  type='button'
                  onClick={toggleRepeatMode}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                     repeatMode !== 'off'
                        ? 'text-purple-400 hover:text-purple-300'
                        : 'text-gray-500 hover:text-white'
                  }`}
                  aria-label={`Repeat: ${repeatMode}`}
               >
                  {repeatIcon}
               </button>
            </div>

            {/* Time — right */}
            <div className='flex-1 text-right hidden sm:block'>
               <span className='text-xs text-gray-500 tabular-nums'>
                  {formatTime(currentTime)} / {formatTime(duration)}
               </span>
            </div>
         </div>
      </div>
   );
};

export default BottomPlayer;
