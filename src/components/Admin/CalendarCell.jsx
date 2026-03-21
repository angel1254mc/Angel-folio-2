import React from 'react';

const handleImageLoad = (e) => {
   e.currentTarget.classList.remove('opacity-0', 'scale-95');
   e.currentTarget.classList.add('opacity-100', 'scale-100');
};

const handleImageError = (e) => {
   e.currentTarget.classList.remove('opacity-0', 'scale-95');
   e.currentTarget.classList.add('opacity-100', 'scale-100');
   e.currentTarget.style.display = 'none';
};

const PlayIcon = () => (
   <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M8 5v14l11-7z' />
   </svg>
);

const PauseIcon = () => (
   <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
   </svg>
);

const EditIcon = () => (
   <svg
      className='w-4 h-4'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125'
      />
   </svg>
);

const CalendarCell = ({
   dateStr,
   day,
   song,
   isToday,
   editable = true,
   isPlaying,
   onEdit,
   onTogglePlay,
   onHover,
   onHoverEnd,
}) => (
   <div
      onMouseMove={
         song
            ? (e) => onHover({ song, x: e.clientX, y: e.clientY })
            : undefined
      }
      onMouseLeave={song ? onHoverEnd : undefined}
      aria-label={`${dateStr}${song ? ` — ${song.title} by ${song.artist}` : ''}`}
      className={`aspect-square relative rounded-md overflow-hidden border transition-all group
         ${isToday ? 'border-purple-500' : 'border-[#242424]'}
         ${song ? '' : 'bg-[#101010] hover:bg-[#1a1a1a] cursor-pointer'}
      `}
      onClick={!song ? () => onEdit(dateStr) : undefined}
   >
      {song ? (
         <>
            <img
               src={song.artwork_url}
               alt={song.title}
               className='w-full h-full object-cover opacity-0 scale-95 transition-[opacity,transform] duration-300 ease-out'
               onLoad={handleImageLoad}
               onError={handleImageError}
            />
            <div
               className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-opacity ${
                  isPlaying
                     ? 'opacity-100'
                     : 'opacity-0 group-hover:opacity-100'
               }`}
            >
               {song.preview_url && (
                  <button
                     type='button'
                     onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlay(song.preview_url);
                     }}
                     className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors'
                     aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                  >
                     {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
               )}
               {editable && (
                  <button
                     type='button'
                     onClick={(e) => {
                        e.stopPropagation();
                        onEdit(dateStr);
                     }}
                     className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors'
                     aria-label='Edit song'
                  >
                     <EditIcon />
                  </button>
               )}
            </div>
         </>
      ) : (
         <span className='absolute inset-0 flex items-center justify-center text-gray-600 group-hover:text-gray-400 text-sm font-medium transition-colors'>
            +
         </span>
      )}
      <span
         className={`absolute top-1 left-1 text-xs font-bold leading-none
            ${song ? 'text-white drop-shadow' : isToday ? 'text-purple-400' : 'text-gray-500'}
         `}
      >
         {day}
      </span>
   </div>
);

export default CalendarCell;
