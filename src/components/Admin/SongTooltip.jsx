import React from 'react';

const SongTooltip = ({ song, x, y }) => (
   <div
      className='fixed z-50 pointer-events-none'
      style={{
         left: Math.min(x + 14, window.innerWidth - 244),
         top: Math.min(y + 14, window.innerHeight - 90),
      }}
   >
      <div className='flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-purple-500/40 shadow-xl w-56'>
         <img
            src={song.artwork_url}
            alt={song.title}
            className='w-12 h-12 rounded object-cover flex-shrink-0'
         />
         <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>{song.title}</p>
            <p className='text-xs text-gray-400 truncate'>{song.artist}</p>
            {song.album && (
               <p className='text-xs text-gray-500 truncate'>{song.album}</p>
            )}
         </div>
      </div>
   </div>
);

export default SongTooltip;
