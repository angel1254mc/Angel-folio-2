'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SECRET = 'playmusic';
const STORAGE_KEY = 'music_ee';

const useEasterEgg = () => {
   const [unlocked, setUnlocked] = useState(false);
   const bufferRef = useRef('');

   // Restore from sessionStorage on mount
   useEffect(() => {
      if (typeof window !== 'undefined') {
         const stored = sessionStorage.getItem(STORAGE_KEY);
         if (stored === '1') setUnlocked(true);
      }
   }, []);

   const handleKeyDown = useCallback(
      (e) => {
         if (unlocked) return;
         // Ignore modifier keys and non-character keys
         if (e.key.length !== 1) return;

         bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(
            -SECRET.length
         );

         if (bufferRef.current === SECRET) {
            setUnlocked(true);
            sessionStorage.setItem(STORAGE_KEY, '1');
         }
      },
      [unlocked]
   );

   useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [handleKeyDown]);

   return { unlocked };
};

export default useEasterEgg;
