'use client';
import React, { useCallback, useEffect, useState } from 'react';
import MusicSearchModal from './MusicSearchModal';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toYYYYMM = (date) =>
   `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const toYYYYMMDD = (year, month, day) =>
   `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const MusicCalendar = () => {
   const [currentMonth, setCurrentMonth] = useState(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
   });
   const [songs, setSongs] = useState({});
   const [selectedDate, setSelectedDate] = useState(null);
   const [loading, setLoading] = useState(false);
   const [tooltip, setTooltip] = useState(null); // { song, x, y }

   const fetchSongs = useCallback(async (monthDate) => {
      setLoading(true);
      try {
         const month = toYYYYMM(monthDate);
         const res = await fetch(`/api/admin/music?month=${month}`);
         const json = await res.json();
         const map = {};
         (json.songs || []).forEach((s) => {
            map[s.date] = s;
         });
         setSongs(map);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchSongs(currentMonth);
   }, [currentMonth, fetchSongs]);

   const prevMonth = () => {
      setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
   };

   const nextMonth = () => {
      setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
   };

   const year = currentMonth.getFullYear();
   const month = currentMonth.getMonth();
   const monthLabel = currentMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
   });

   const firstDayOfWeek = new Date(year, month, 1).getDay();
   const daysInMonth = new Date(year, month + 1, 0).getDate();

   const today = new Date();
   const todayStr = toYYYYMMDD(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
   );

   const cells = [];
   for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

   const handleSave = (savedSong) => {
      setSongs((prev) => ({ ...prev, [savedSong.date]: savedSong }));
      setSelectedDate(null);
   };

   return (
      <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] px-6 pb-8'>
         {/* Month navigation */}
         <div className='flex items-center justify-between mb-4'>
            <button
               onClick={prevMonth}
               className='px-3 py-1 rounded bg-[#1a1a1a] text-white hover:bg-[#242424] transition-colors'
            >
               ←
            </button>
            <h2 className='text-xl font-semibold'>
               {monthLabel}
               {loading && (
                  <span className='ml-2 text-sm text-gray-500 font-normal'>
                     Loading...
                  </span>
               )}
            </h2>
            <button
               onClick={nextMonth}
               className='px-3 py-1 rounded bg-[#1a1a1a] text-white hover:bg-[#242424] transition-colors'
            >
               →
            </button>
         </div>

         {/* Weekday headers */}
         <div className='grid grid-cols-7 mb-1'>
            {WEEKDAYS.map((d) => (
               <div
                  key={d}
                  className='text-center text-xs text-gray-500 py-1 font-medium'
               >
                  {d}
               </div>
            ))}
         </div>

         {/* Day cells */}
         <div
            className={`grid grid-cols-7 gap-1 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}
         >
            {cells.map((day, idx) => {
               if (day === null) {
                  return <div key={`empty-${idx}`} className='aspect-square' />;
               }
               const dateStr = toYYYYMMDD(year, month, day);
               const song = songs[dateStr];
               const isToday = dateStr === todayStr;

               return (
                  <div
                     key={dateStr}
                     onClick={() => setSelectedDate(dateStr)}
                     onMouseMove={
                        song
                           ? (e) =>
                                setTooltip({ song, x: e.clientX, y: e.clientY })
                           : undefined
                     }
                     onMouseLeave={song ? () => setTooltip(null) : undefined}
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
                              onLoad={(e) => {
                                 e.currentTarget.classList.remove(
                                    'opacity-0',
                                    'scale-95'
                                 );
                                 e.currentTarget.classList.add(
                                    'opacity-100',
                                    'scale-100'
                                 );
                              }}
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
                  </div>
               );
            })}
         </div>

         {selectedDate && (
            <MusicSearchModal
               date={selectedDate}
               existingSong={songs[selectedDate] || null}
               onSave={handleSave}
               onClose={() => setSelectedDate(null)}
            />
         )}

         {tooltip && (
            <div
               className='fixed z-50 pointer-events-none'
               style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
            >
               <div className='flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-purple-500/40 shadow-xl w-56'>
                  <img
                     src={tooltip.song.artwork_url}
                     alt={tooltip.song.title}
                     className='w-12 h-12 rounded object-cover flex-shrink-0'
                  />
                  <div className='flex-1 min-w-0'>
                     <p className='text-sm font-medium truncate'>
                        {tooltip.song.title}
                     </p>
                     <p className='text-xs text-gray-400 truncate'>
                        {tooltip.song.artist}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default MusicCalendar;
