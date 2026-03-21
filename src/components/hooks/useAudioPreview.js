import { useCallback, useEffect, useRef, useState } from 'react';

const FADE_DURATION = 600; // ms
const FADE_STEPS = 20;
const TARGET_VOLUME = 0.3;

const useAudioPreview = () => {
   const cacheRef = useRef(new Map());
   const activeRef = useRef(null);
   const fadeRef = useRef(null);
   const endedHandlerRef = useRef(null);
   const [playing, setPlaying] = useState(false);
   const [playingUrl, setPlayingUrl] = useState(null);
   const [playingId, setPlayingId] = useState(null);

   const clearFade = () => {
      if (fadeRef.current) {
         clearInterval(fadeRef.current);
         fadeRef.current = null;
      }
   };

   const getOrCreateAudio = (url) => {
      if (!url) return null;
      let audio = cacheRef.current.get(url);
      if (!audio) {
         audio = new Audio(url);
         audio.preload = 'auto';
         cacheRef.current.set(url, audio);
      }
      return audio;
   };

   const fadeIn = (audio) => {
      clearFade();
      audio.volume = 0;
      const playPromise = audio.play();
      const step = TARGET_VOLUME / FADE_STEPS;
      const interval = FADE_DURATION / FADE_STEPS;
      fadeRef.current = setInterval(() => {
         const next = Math.min(audio.volume + step, TARGET_VOLUME);
         audio.volume = next;
         if (next >= TARGET_VOLUME) clearFade();
      }, interval);
      return playPromise;
   };

   const fadeOut = (audio) => {
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
   };

   const cleanupEnded = () => {
      if (endedHandlerRef.current && activeRef.current) {
         activeRef.current.removeEventListener('ended', endedHandlerRef.current);
         endedHandlerRef.current = null;
      }
   };

   // Stop playback and release all cached Audio elements
   const clearCache = useCallback(() => {
      cleanupEnded();
      clearFade();
      if (activeRef.current) {
         activeRef.current.pause();
         activeRef.current = null;
      }
      cacheRef.current.forEach((audio) => {
         audio.pause();
         audio.src = '';
      });
      cacheRef.current.clear();
      setPlaying(false);
      setPlayingUrl(null);
      setPlayingId(null);
   }, []);

   // Stop audio and clear timers on unmount
   useEffect(() => {
      return () => {
         cleanupEnded();
         clearFade();
         if (activeRef.current) {
            activeRef.current.pause();
            activeRef.current = null;
         }
      };
   }, []);

   // Eagerly buffer audio so it's ready on click
   const preload = useCallback((previewUrl) => {
      getOrCreateAudio(previewUrl);
   }, []);

   const play = useCallback((previewUrl, id) => {
      if (!previewUrl) return;
      const audio = getOrCreateAudio(previewUrl);

      if (activeRef.current && activeRef.current !== audio) {
         cleanupEnded();
         activeRef.current.pause();
         activeRef.current.currentTime = 0;
      }

      activeRef.current = audio;
      setPlaying(true);
      setPlayingUrl(previewUrl);
      setPlayingId(id ?? null);
      fadeIn(audio).catch(() => {
         clearFade();
         setPlaying(false);
         setPlayingUrl(null);
         setPlayingId(null);
         activeRef.current = null;
         cleanupEnded();
      });

      cleanupEnded();
      const onEnded = () => {
         setPlaying(false);
         setPlayingUrl(null);
         setPlayingId(null);
         activeRef.current = null;
      };
      endedHandlerRef.current = onEnded;
      audio.addEventListener('ended', onEnded);
   }, []);

   const pause = useCallback(() => {
      if (!activeRef.current) return;
      setPlaying(false);
      setPlayingUrl(null);
      setPlayingId(null);
      fadeOut(activeRef.current);
      cleanupEnded();
   }, []);

   const toggle = useCallback(
      (previewUrl, id) => {
         // Match by id when provided, otherwise fall back to URL
         const isActive = id != null
            ? playing && playingId === id
            : playing && playingUrl === previewUrl;
         if (isActive) {
            pause();
         } else {
            play(previewUrl, id);
         }
      },
      [playing, playingId, playingUrl, play, pause]
   );

   return { preload, clearCache, play, pause, toggle, playing, playingUrl, playingId };
};

export default useAudioPreview;
