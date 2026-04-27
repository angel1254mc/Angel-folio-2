'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import MusicCalendar from './Admin/MusicCalendar';
import BottomPlayer from './BottomPlayer';
import useEasterEgg from './hooks/useEasterEgg';
import usePlaylist from './hooks/usePlaylist';
import { toYYYYMM } from './Admin/calendarUtils';

const MusicPageClient = () => {
   const { unlocked } = useEasterEgg();
   const [showToast, setShowToast] = useState(false);
   const [songs, setSongs] = useState({});
   const [currentMonth, setCurrentMonth] = useState(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
   });
   const [loading, setLoading] = useState(false);
   const fetchIdRef = useRef(0);
   const playlist = usePlaylist();

   const fetchSongs = useCallback(async (monthDate) => {
      const id = ++fetchIdRef.current;
      setLoading(true);
      try {
         const month = toYYYYMM(monthDate);
         const res = await fetch(`/api/music?month=${month}`);
         const json = await res.json();
         if (id !== fetchIdRef.current) return;
         const map = {};
         (json.songs || []).forEach((s) => {
            map[s.date] = s;
         });
         setSongs(map);
      } finally {
         if (id === fetchIdRef.current) setLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchSongs(currentMonth);
   }, [currentMonth, fetchSongs]);

   useEffect(() => {
      if (unlocked) {
         playlist.loadMonth(songs);
      }
   }, [songs, unlocked, playlist.loadMonth]);

   useEffect(() => {
      if (unlocked) {
         setShowToast(true);
         const timer = setTimeout(() => setShowToast(false), 2000);
         return () => clearTimeout(timer);
      }
   }, [unlocked]);

   const playerVisible = unlocked && playlist.currentSong;

   return (
      <>
         {showToast && (
            <div className='fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg shadow-lg animate-pulse'>
               Full play mode unlocked
            </div>
         )}
         <MusicCalendar
            editable={false}
            fullPlayMode={unlocked}
            songsExternal={songs}
            currentMonthExternal={currentMonth}
            setCurrentMonthExternal={setCurrentMonth}
            loadingExternal={loading}
            playingDateStr={playlist.currentDateStr}
            isPlayingExternal={playlist.isPlaying}
            loadingDateStr={playlist.loadingDateStr}
            onCellPlay={(song, dateStr) => playlist.playFromDate(dateStr)}
         />
         {playerVisible && <BottomPlayer playlist={playlist} />}
         {playerVisible && <div className='h-24' />}
      </>
   );
};

export default MusicPageClient;
