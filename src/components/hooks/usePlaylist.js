'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const FADE_DURATION = 600;
const FADE_STEPS = 20;
const TARGET_VOLUME = 0.3;
const MAX_CONSECUTIVE_FAILURES = 3;

function fisherYatesShuffle(arr, keepFirstIndex) {
   const result = [...arr];
   if (keepFirstIndex != null) {
      const idx = result.findIndex((_, i) => i === keepFirstIndex);
      if (idx > 0) {
         [result[0], result[idx]] = [result[idx], result[0]];
      }
      for (let i = result.length - 1; i > 1; i--) {
         const j = 1 + Math.floor(Math.random() * i);
         [result[i], result[j]] = [result[j], result[i]];
      }
   } else {
      for (let i = result.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [result[i], result[j]] = [result[j], result[i]];
      }
   }
   return result;
}

function formatTime(seconds) {
   if (!seconds || !isFinite(seconds)) return '0:00';
   const m = Math.floor(seconds / 60);
   const s = Math.floor(seconds % 60);
   return `${m}:${s.toString().padStart(2, '0')}`;
}

const usePlaylist = () => {
   const audioRef = useRef(null);
   const fadeRef = useRef(null);
   const abortRef = useRef(null);
   const urlCacheRef = useRef(new Map());
   const orderedRef = useRef([]);
   const shuffledRef = useRef([]);
   const indexRef = useRef(0);
   const failCountRef = useRef(0);
   const seekingRef = useRef(false);

   const [currentSong, setCurrentSong] = useState(null);
   const [currentDateStr, setCurrentDateStr] = useState(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [loadingDateStr, setLoadingDateStr] = useState(null);
   const [progress, setProgress] = useState(0);
   const [duration, setDuration] = useState(0);
   const [currentTime, setCurrentTime] = useState(0);
   const [shuffleOn, setShuffleOn] = useState(false);
   const [repeatMode, setRepeatMode] = useState('off');

   const shuffleOnRef = useRef(false);
   const repeatModeRef = useRef('off');

   useEffect(() => {
      shuffleOnRef.current = shuffleOn;
   }, [shuffleOn]);
   useEffect(() => {
      repeatModeRef.current = repeatMode;
   }, [repeatMode]);

   const getPlaylist = useCallback(() => {
      return shuffleOnRef.current ? shuffledRef.current : orderedRef.current;
   }, []);

   const getAudio = useCallback(() => {
      if (!audioRef.current) {
         audioRef.current = new Audio();
         audioRef.current.preload = 'auto';
      }
      return audioRef.current;
   }, []);

   const clearFade = useCallback(() => {
      if (fadeRef.current) {
         clearInterval(fadeRef.current);
         fadeRef.current = null;
      }
   }, []);

   const fadeIn = useCallback(
      (audio) => {
         clearFade();
         audio.volume = 0;
         const step = TARGET_VOLUME / FADE_STEPS;
         const interval = FADE_DURATION / FADE_STEPS;
         fadeRef.current = setInterval(() => {
            const next = Math.min(audio.volume + step, TARGET_VOLUME);
            audio.volume = next;
            if (next >= TARGET_VOLUME) clearFade();
         }, interval);
      },
      [clearFade]
   );

   const fadeOut = useCallback(
      (audio) => {
         clearFade();
         const startVol = audio.volume;
         if (startVol === 0) {
            audio.pause();
            return;
         }
         const step = startVol / FADE_STEPS;
         const interval = FADE_DURATION / FADE_STEPS;
         fadeRef.current = setInterval(() => {
            const next = Math.max(audio.volume - step, 0);
            audio.volume = next;
            if (next <= 0) {
               clearFade();
               audio.pause();
            }
         }, interval);
      },
      [clearFade]
   );

   const fetchTrackUrl = useCallback(async (song, signal) => {
      const cached = urlCacheRef.current.get(song.deezer_id);
      if (cached) return cached;

      const params = new URLSearchParams({
         deezer_id: song.deezer_id,
         title: song.title,
         artist: song.artist,
      });
      const res = await fetch(`/api/music/full-track?${params}`, { signal });
      if (!res.ok) throw new Error(`Track fetch failed: ${res.status}`);
      const data = await res.json();
      urlCacheRef.current.set(song.deezer_id, data.url);
      return data.url;
   }, []);

   const playSongAtIndex = useCallback(
      async (index) => {
         const playlist = getPlaylist();
         if (index < 0 || index >= playlist.length) return;

         if (abortRef.current) abortRef.current.abort();
         abortRef.current = new AbortController();

         const { dateStr, song } = playlist[index];
         indexRef.current = index;
         setCurrentSong(song);
         setCurrentDateStr(dateStr);
         setIsLoading(true);
         setLoadingDateStr(dateStr);
         setProgress(0);
         setCurrentTime(0);
         setDuration(0);

         const audio = getAudio();
         clearFade();
         audio.pause();

         try {
            const url = await fetchTrackUrl(song, abortRef.current.signal);
            audio.src = url;
            audio.currentTime = 0;
            await audio.play();
            fadeIn(audio);
            setIsPlaying(true);
            setIsLoading(false);
            setLoadingDateStr(null);
            failCountRef.current = 0;
         } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn('[usePlaylist] Track load failed:', err);
            setIsLoading(false);
            setLoadingDateStr(null);
            failCountRef.current++;
            if (failCountRef.current < MAX_CONSECUTIVE_FAILURES) {
               const nextIdx = index + 1;
               if (nextIdx < playlist.length) {
                  playSongAtIndex(nextIdx);
               } else if (repeatModeRef.current === 'all') {
                  playSongAtIndex(0);
               } else {
                  setIsPlaying(false);
               }
            } else {
               failCountRef.current = 0;
               setIsPlaying(false);
            }
         }
      },
      [getPlaylist, getAudio, clearFade, fadeIn, fetchTrackUrl]
   );

   const next = useCallback(() => {
      const playlist = getPlaylist();
      if (playlist.length === 0) return;
      const nextIdx = indexRef.current + 1;
      if (nextIdx < playlist.length) {
         playSongAtIndex(nextIdx);
      } else if (repeatModeRef.current === 'all') {
         playSongAtIndex(0);
      }
   }, [getPlaylist, playSongAtIndex]);

   const prev = useCallback(() => {
      const playlist = getPlaylist();
      if (playlist.length === 0) return;
      const audio = getAudio();
      if (audio.currentTime > 3) {
         audio.currentTime = 0;
         return;
      }
      const prevIdx = indexRef.current - 1;
      if (prevIdx >= 0) {
         playSongAtIndex(prevIdx);
      } else if (repeatModeRef.current === 'all') {
         playSongAtIndex(playlist.length - 1);
      }
   }, [getPlaylist, getAudio, playSongAtIndex]);

   useEffect(() => {
      const audio = getAudio();

      const onTimeUpdate = () => {
         if (seekingRef.current) return;
         const dur = audio.duration || 0;
         setCurrentTime(audio.currentTime);
         setDuration(dur);
         setProgress(dur > 0 ? audio.currentTime / dur : 0);
      };

      const onEnded = () => {
         if (repeatModeRef.current === 'one') {
            audio.currentTime = 0;
            audio.play();
            return;
         }
         const playlist = shuffleOnRef.current
            ? shuffledRef.current
            : orderedRef.current;
         const nextIdx = indexRef.current + 1;
         if (nextIdx < playlist.length) {
            playSongAtIndex(nextIdx);
         } else if (repeatModeRef.current === 'all') {
            playSongAtIndex(0);
         } else {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
         }
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', onEnded);

      return () => {
         audio.removeEventListener('timeupdate', onTimeUpdate);
         audio.removeEventListener('ended', onEnded);
      };
   }, [getAudio, playSongAtIndex]);

   useEffect(() => {
      return () => {
         clearFade();
         if (abortRef.current) abortRef.current.abort();
         if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
         }
      };
   }, [clearFade]);

   const loadMonth = useCallback(
      (songsMap) => {
         const entries = Object.entries(songsMap)
            .filter(([, song]) => song && song.deezer_id)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateStr, song]) => ({ dateStr, song }));
         orderedRef.current = entries;
         shuffledRef.current = fisherYatesShuffle(entries);
      },
      []
   );

   const playFromDate = useCallback(
      (dateStr) => {
         const playlist = getPlaylist();
         if (playlist.length === 0) return;

         if (currentDateStr === dateStr && isPlaying) {
            const audio = getAudio();
            fadeOut(audio);
            setIsPlaying(false);
            return;
         }
         if (currentDateStr === dateStr && !isPlaying && !isLoading) {
            const audio = getAudio();
            audio.play();
            fadeIn(audio);
            setIsPlaying(true);
            return;
         }

         const idx = playlist.findIndex((e) => e.dateStr === dateStr);
         if (idx >= 0) {
            playSongAtIndex(idx);
         }
      },
      [
         getPlaylist,
         getAudio,
         currentDateStr,
         isPlaying,
         isLoading,
         fadeIn,
         fadeOut,
         playSongAtIndex,
      ]
   );

   const togglePlayPause = useCallback(() => {
      const audio = getAudio();
      if (!currentSong) return;
      if (isPlaying) {
         fadeOut(audio);
         setIsPlaying(false);
      } else {
         audio.play();
         fadeIn(audio);
         setIsPlaying(true);
      }
   }, [getAudio, currentSong, isPlaying, fadeIn, fadeOut]);

   const seek = useCallback(
      (fraction) => {
         const audio = getAudio();
         if (!audio.duration) return;
         seekingRef.current = true;
         audio.currentTime = fraction * audio.duration;
         setProgress(fraction);
         setCurrentTime(audio.currentTime);
         seekingRef.current = false;
      },
      [getAudio]
   );

   const toggleShuffle = useCallback(() => {
      setShuffleOn((prev) => {
         const next = !prev;
         shuffleOnRef.current = next;
         if (next) {
            const currentIdx = indexRef.current;
            shuffledRef.current = fisherYatesShuffle(
               orderedRef.current,
               currentIdx
            );
            indexRef.current = 0;
         } else {
            if (currentDateStr) {
               const idx = orderedRef.current.findIndex(
                  (e) => e.dateStr === currentDateStr
               );
               if (idx >= 0) indexRef.current = idx;
            }
         }
         return next;
      });
   }, [currentDateStr]);

   const toggleRepeatMode = useCallback(() => {
      setRepeatMode((prev) => {
         const modes = ['off', 'all', 'one'];
         const next = modes[(modes.indexOf(prev) + 1) % modes.length];
         repeatModeRef.current = next;
         return next;
      });
   }, []);

   const stop = useCallback(() => {
      if (abortRef.current) abortRef.current.abort();
      const audio = getAudio();
      clearFade();
      audio.pause();
      audio.src = '';
      setCurrentSong(null);
      setCurrentDateStr(null);
      setIsPlaying(false);
      setIsLoading(false);
      setLoadingDateStr(null);
      setProgress(0);
      setDuration(0);
      setCurrentTime(0);
   }, [getAudio, clearFade]);

   return {
      loadMonth,
      playFromDate,
      togglePlayPause,
      next,
      prev,
      seek,
      toggleShuffle,
      toggleRepeatMode,
      stop,
      currentSong,
      currentDateStr,
      isPlaying,
      isLoading,
      loadingDateStr,
      progress,
      duration,
      currentTime,
      shuffleOn,
      repeatMode,
      formatTime,
   };
};

export default usePlaylist;
