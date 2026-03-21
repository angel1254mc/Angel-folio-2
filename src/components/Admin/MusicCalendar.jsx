'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MusicSearchModal from './MusicSearchModal';
import CalendarCell from './CalendarCell';
import SongTooltip from './SongTooltip';
import { WEEKDAYS, toYYYYMM, toYYYYMMDD } from './calendarUtils';
import useAudioPreview from '../hooks/useAudioPreview';

const MusicCalendar = ({ editable = true }) => {
   const [currentMonth, setCurrentMonth] = useState(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
   });
   const [songs, setSongs] = useState({});
   const [selectedDate, setSelectedDate] = useState(null);
   const [loading, setLoading] = useState(false);
   const [tooltip, setTooltip] = useState(null);
   const fetchIdRef = useRef(0);
   const { preload, toggle, playing, playingUrl } = useAudioPreview();

   const fetchSongs = useCallback(async (monthDate) => {
      const id = ++fetchIdRef.current;
      setLoading(true);
      try {
         const month = toYYYYMM(monthDate);
         const res = await fetch(`/api/admin/music?month=${month}`);
         const json = await res.json();
         if (id !== fetchIdRef.current) return;
         const map = {};
         (json.songs || []).forEach((s) => {
            map[s.date] = s;
            if (s.preview_url) preload(s.preview_url);
         });
         setSongs(map);
      } finally {
         if (id === fetchIdRef.current) setLoading(false);
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
               return (
                  <CalendarCell
                     key={dateStr}
                     dateStr={dateStr}
                     day={day}
                     song={song}
                     isToday={dateStr === todayStr}
                     editable={editable}
                     isPlaying={
                        playing && !!song?.preview_url && playingUrl === song.preview_url
                     }
                     onEdit={setSelectedDate}
                     onTogglePlay={toggle}
                     onHover={setTooltip}
                     onHoverEnd={() => setTooltip(null)}
                  />
               );
            })}
         </div>

         {tooltip && (
            <SongTooltip
               song={tooltip.song}
               x={tooltip.x}
               y={tooltip.y}
            />
         )}

         {selectedDate && (
            <MusicSearchModal
               date={selectedDate}
               existingSong={songs[selectedDate] || null}
               onSave={handleSave}
               onClose={() => setSelectedDate(null)}
            />
         )}
      </div>
   );
};

export default MusicCalendar;
