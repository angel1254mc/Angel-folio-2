'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MusicSearchModal from './MusicSearchModal';
import CalendarCell from './CalendarCell';
import SongTooltip from './SongTooltip';
import { WEEKDAYS, toYYYYMM, toYYYYMMDD } from './calendarUtils';
import useAudioPreview from '../hooks/useAudioPreview';

const MusicCalendar = ({
   editable = true,
   fullPlayMode = false,
   songsExternal,
   currentMonthExternal,
   setCurrentMonthExternal,
   loadingExternal,
   playingDateStr: playingDateStrProp,
   isPlayingExternal,
   loadingDateStr: loadingDateStrProp,
   onCellPlay,
}) => {
   const useExternal = !editable && songsExternal !== undefined;

   const [internalMonth, setInternalMonth] = useState(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
   });
   const [internalSongs, setInternalSongs] = useState({});
   const [selectedDate, setSelectedDate] = useState(null);
   const [internalLoading, setInternalLoading] = useState(false);
   const [tooltip, setTooltip] = useState(null);
   const fetchIdRef = useRef(0);
   const { preload, clearCache, toggle, playing, playingId } =
      useAudioPreview();

   const songs = useExternal ? songsExternal : internalSongs;
   const setSongs = useExternal ? undefined : setInternalSongs;
   const currentMonth = useExternal ? currentMonthExternal : internalMonth;
   const setCurrentMonth = useExternal
      ? setCurrentMonthExternal
      : setInternalMonth;
   const loading = useExternal ? loadingExternal : internalLoading;

   const resolvePreviewUrls = useCallback(
      async (songMap, id) => {
         if (useExternal) return;
         const toResolve = Object.values(songMap).filter((s) => s.deezer_id);
         if (toResolve.length === 0) return;
         try {
            const ids = toResolve.map((s) => s.deezer_id).join(',');
            const res = await fetch(`/api/music/preview?ids=${ids}`);
            const json = await res.json();
            if (id !== fetchIdRef.current) return;
            setInternalSongs((prev) => {
               const next = { ...prev };
               for (const s of toResolve) {
                  const url = json.previews?.[s.deezer_id];
                  if (url && next[s.date]) {
                     next[s.date] = { ...next[s.date], preview_url: url };
                     preload(url);
                  }
               }
               return next;
            });
         } catch {
            // silent
         }
      },
      [useExternal, preload]
   );

   const fetchSongs = useCallback(
      async (monthDate) => {
         if (useExternal) return;
         const id = ++fetchIdRef.current;
         clearCache();
         setInternalLoading(true);
         try {
            const month = toYYYYMM(monthDate);
            const apiBase = editable ? '/api/admin/music' : '/api/music';
            const res = await fetch(`${apiBase}?month=${month}`);
            const json = await res.json();
            if (id !== fetchIdRef.current) return;
            const map = {};
            (json.songs || []).forEach((s) => {
               map[s.date] = s;
               if (!s.deezer_id && s.preview_url) preload(s.preview_url);
            });
            setInternalSongs(map);
            resolvePreviewUrls(map, id);
         } finally {
            if (id === fetchIdRef.current) setInternalLoading(false);
         }
      },
      [useExternal, editable, resolvePreviewUrls, clearCache, preload]
   );

   useEffect(() => {
      if (!useExternal) {
         fetchSongs(currentMonth);
      }
   }, [currentMonth, fetchSongs, useExternal]);

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

   const handleSave = async (savedSong) => {
      if (!setSongs) return;
      setSongs((prev) => ({ ...prev, [savedSong.date]: savedSong }));
      setSelectedDate(null);
      if (savedSong.deezer_id) {
         try {
            const res = await fetch(
               `/api/music/preview?ids=${savedSong.deezer_id}`
            );
            const json = await res.json();
            const url = json.previews?.[savedSong.deezer_id];
            if (url) {
               setSongs((prev) => ({
                  ...prev,
                  [savedSong.date]: {
                     ...prev[savedSong.date],
                     preview_url: url,
                  },
               }));
               preload(url);
            }
         } catch {
            // silent
         }
      }
   };

   const getCellPlayState = (dateStr) => {
      if (useExternal && fullPlayMode) {
         return {
            isPlaying: isPlayingExternal && playingDateStrProp === dateStr,
            loadingTrack: loadingDateStrProp === dateStr,
         };
      }
      return {
         isPlaying: playing && playingId === dateStr,
         loadingTrack: false,
      };
   };

   const handleTogglePlay = useCallback(
      (songOrUrl, dateStr) => {
         if (useExternal && fullPlayMode && onCellPlay) {
            const song = typeof songOrUrl === 'string' ? songs[dateStr] : songOrUrl;
            onCellPlay(song, dateStr);
         } else {
            toggle(songOrUrl, dateStr);
         }
      },
      [useExternal, fullPlayMode, onCellPlay, songs, toggle]
   );

   return (
      <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] px-6 pb-8'>
         {/* Month navigation */}
         <div className='flex items-center justify-between mb-4'>
            <button
               onClick={prevMonth}
               className='px-3 py-1 rounded bg-[#1a1a1a] text-white hover:bg-[#242424] transition-colors'
            >
               &larr;
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
               &rarr;
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
               const { isPlaying: cellPlaying, loadingTrack } =
                  getCellPlayState(dateStr);
               return (
                  <CalendarCell
                     key={dateStr}
                     dateStr={dateStr}
                     day={day}
                     song={song}
                     isToday={dateStr === todayStr}
                     editable={editable}
                     isPlaying={cellPlaying}
                     fullPlayMode={fullPlayMode}
                     loadingTrack={loadingTrack}
                     onEdit={setSelectedDate}
                     onTogglePlay={handleTogglePlay}
                     onHover={setTooltip}
                     onHoverEnd={() => setTooltip(null)}
                  />
               );
            })}
         </div>

         {tooltip && (
            <SongTooltip song={tooltip.song} x={tooltip.x} y={tooltip.y} />
         )}

         {editable && selectedDate && (
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
