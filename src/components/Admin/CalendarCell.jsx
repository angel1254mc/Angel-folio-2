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

const CalendarCell = ({ dateStr, day, song, isToday, onSelect, onHover, onHoverEnd }) => (
   <button
      type='button'
      onClick={() => onSelect(dateStr)}
      onMouseMove={
         song
            ? (e) => onHover({ song, x: e.clientX, y: e.clientY })
            : undefined
      }
      onMouseLeave={song ? onHoverEnd : undefined}
      aria-label={`${dateStr}${song ? ` — ${song.title} by ${song.artist}` : ''}`}
      className={`aspect-square relative cursor-pointer rounded-md overflow-hidden border transition-all group
         ${isToday ? 'border-purple-500' : 'border-[#242424]'}
         ${song ? '' : 'bg-[#101010] hover:bg-[#1a1a1a]'}
      `}
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
            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity' />
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
   </button>
);

export default CalendarCell;
