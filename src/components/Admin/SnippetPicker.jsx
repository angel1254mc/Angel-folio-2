'use client';
import React, { useEffect, useRef, useState } from 'react';
import useWaveform from './useWaveform';
import { PlayIcon, PauseIcon } from '../icons/AudioIcons';

const CLIP = 15; // seconds

function fmt(s) {
   s = Math.max(0, Math.round(s || 0));
   const m = Math.floor(s / 60);
   const r = s % 60;
   return `${m}:${String(r).padStart(2, '0')}`;
}

const SnippetPicker = ({
   audioUrl,
   durationSec,
   title,
   channel,
   thumbnail,
   clipping,
   onConfirm,
   onBack,
}) => {
   const { peaks, duration: wfDuration, loading, error } = useWaveform(audioUrl);
   const duration = wfDuration || durationSec || 0;
   const maxStart = Math.max(0, duration - CLIP);
   const clipLen = Math.min(CLIP, duration || CLIP);

   const [startSec, setStartSec] = useState(0);
   const [playing, setPlaying] = useState(false);
   const [cursor, setCursor] = useState(0);

   const audioRef = useRef(null);
   const trackRef = useRef(null);
   const draggingRef = useRef(false);

   // Clamp the window start once the real duration is known.
   useEffect(() => {
      setStartSec((s) => Math.min(s, maxStart));
   }, [maxStart]);

   const windowPct = duration ? (clipLen / duration) * 100 : 100;
   const leftPct = duration ? (startSec / duration) * 100 : 0;

   const seekFromClientX = (clientX) => {
      const el = trackRef.current;
      if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const newStart = Math.max(0, Math.min(maxStart, ratio * duration));
      setStartSec(newStart);
      if (audioRef.current) audioRef.current.currentTime = newStart;
   };

   const onPointerDown = (e) => {
      draggingRef.current = true;
      seekFromClientX(e.clientX);
      e.preventDefault();
   };

   useEffect(() => {
      const move = (e) => {
         if (draggingRef.current) seekFromClientX(e.clientX);
      };
      const up = () => {
         draggingRef.current = false;
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      return () => {
         window.removeEventListener('pointermove', move);
         window.removeEventListener('pointerup', up);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [maxStart, duration]);

   const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
         audio.pause();
         setPlaying(false);
      } else {
         audio.currentTime = startSec;
         audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
      }
   };

   // Loop playback within [startSec, startSec + clipLen] and drive the playhead.
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const onTime = () => {
         setCursor(audio.currentTime);
         if (audio.currentTime >= startSec + clipLen) {
            audio.currentTime = startSec;
         }
      };
      const onEnded = () => setPlaying(false);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('ended', onEnded);
      return () => {
         audio.removeEventListener('timeupdate', onTime);
         audio.removeEventListener('ended', onEnded);
      };
   }, [startSec, clipLen]);

   useEffect(() => {
      const audio = audioRef.current;
      return () => {
         if (audio) audio.pause();
      };
   }, []);

   const playheadPct = duration && playing ? (cursor / duration) * 100 : null;

   return (
      <div className='flex flex-col gap-3'>
         <audio ref={audioRef} src={audioUrl} preload='auto' />

         {/* Header */}
         <div className='flex items-center gap-3'>
            {thumbnail && (
               <img
                  src={thumbnail}
                  alt={title}
                  className='w-12 h-12 rounded object-cover flex-shrink-0'
               />
            )}
            <div className='flex-1 min-w-0'>
               <p className='text-sm font-medium truncate'>{title}</p>
               <p className='text-xs text-gray-400 truncate'>{channel}</p>
            </div>
            <button
               type='button'
               onClick={togglePlay}
               disabled={loading || !!error}
               className='w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 disabled:opacity-40 flex items-center justify-center text-white flex-shrink-0'
               aria-label={playing ? 'Pause preview' : 'Play preview'}
            >
               {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
         </div>

         {/* Waveform */}
         <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            className='relative h-24 bg-[#0f0f0f] rounded-lg overflow-hidden cursor-grab select-none'
         >
            {loading ? (
               <div className='absolute inset-0 flex items-center justify-center text-xs text-gray-500'>
                  Analyzing audio…
               </div>
            ) : error ? (
               <div className='absolute inset-0 flex items-center justify-center text-xs text-red-400 px-3 text-center'>
                  {error}
               </div>
            ) : (
               <>
                  <div className='absolute inset-0 flex items-center gap-[2px] px-1'>
                     {peaks.map((p, i) => {
                        const barStart = (i / peaks.length) * 100;
                        const inWindow =
                           barStart >= leftPct && barStart <= leftPct + windowPct;
                        return (
                           <div
                              key={i}
                              className={`flex-1 rounded-sm ${
                                 inWindow ? 'bg-purple-400' : 'bg-[#3a3a3a]'
                              }`}
                              style={{ height: `${Math.max(6, p * 100)}%` }}
                           />
                        );
                     })}
                  </div>
                  <div
                     className='absolute top-0 bottom-0 border-2 border-purple-500 rounded-md bg-purple-500/10 pointer-events-none'
                     style={{ left: `${leftPct}%`, width: `${windowPct}%` }}
                  />
                  {playheadPct != null && (
                     <div
                        className='absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none'
                        style={{ left: `${playheadPct}%` }}
                     />
                  )}
               </>
            )}
         </div>

         {/* Ruler */}
         <div className='flex justify-between text-[10px] text-gray-500 tabular-nums'>
            <span>0:00</span>
            <span>{fmt(duration * 0.25)}</span>
            <span>{fmt(duration * 0.5)}</span>
            <span>{fmt(duration * 0.75)}</span>
            <span>{fmt(duration)}</span>
         </div>

         <div className='text-center text-xs text-gray-300'>
            Snippet:{' '}
            <span className='tabular-nums'>
               {fmt(startSec)} → {fmt(startSec + clipLen)}
            </span>{' '}
            · {Math.round(clipLen)}s
         </div>

         {/* Actions */}
         <div className='flex gap-2'>
            <button
               type='button'
               onClick={onBack}
               className='px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#303030] text-sm text-gray-300 hover:text-white'
            >
               Back
            </button>
            <button
               type='button'
               onClick={() => onConfirm(startSec)}
               disabled={loading || !!error || clipping}
               className='flex-1 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm'
            >
               {clipping ? 'Saving snippet…' : 'Use this snippet →'}
            </button>
         </div>
      </div>
   );
};

export default SnippetPicker;
