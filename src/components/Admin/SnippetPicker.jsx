'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useWaveform from './useWaveform';
import { PlayIcon, PauseIcon } from '../icons/AudioIcons';

const CLIP = 15; // seconds
const BARS_PER_SEC = 6;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
   // Resolution for the zoomed waveform — finer than the old 64 bars.
   // Derived from the prepared durationSec so it's known before decode.
   const barCount = useMemo(
      () => clamp(Math.round((durationSec || 60) * BARS_PER_SEC), 64, 2000),
      [durationSec]
   );
   const { peaks, duration: wfDuration, loading, error } = useWaveform(
      audioUrl,
      barCount
   );

   const duration = wfDuration || durationSec || 0;
   const clipLen = Math.min(CLIP, duration || CLIP);
   const maxStart = Math.max(0, duration - CLIP);

   const [start, setStart] = useState(0);
   const [playing, setPlaying] = useState(false);
   const [cursor, setCursor] = useState(0);
   const [trackWidth, setTrackWidth] = useState(0);

   const audioRef = useRef(null);
   const trackRef = useRef(null);
   const dragRef = useRef(null); // { startX, startAt } while dragging

   // Measure the track width (responsive zoom) + keep it current on resize.
   useEffect(() => {
      const el = trackRef.current;
      if (!el) return;
      const update = () => setTrackWidth(el.clientWidth);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
   }, []);

   // Clamp the start once the real duration is known.
   useEffect(() => {
      setStart((s) => clamp(s, 0, maxStart));
   }, [maxStart]);

   const pxPerSec = trackWidth ? trackWidth / 2 / CLIP : 0;
   const stripWidth = duration * pxPerSec;
   const center = trackWidth / 2;
   const translateX = center - start * pxPerSec;
   const canDrag = !loading && !error && maxStart > 0;
   const highlightWidth = clipLen * pxPerSec;

   // Memoize the bars so scrubbing (start change) doesn't rebuild them.
   const bars = useMemo(() => {
      if (!peaks.length || !stripWidth) return null;
      return (
         <div
            className='absolute top-0 bottom-0 left-0 flex items-center gap-[1px]'
            style={{ width: `${stripWidth}px` }}
         >
            {peaks.map((p, i) => (
               <div
                  key={i}
                  className='flex-1 rounded-sm bg-[#4a4a4a]'
                  style={{ height: `${Math.max(6, p * 100)}%` }}
               />
            ))}
         </div>
      );
   }, [peaks, stripWidth]);

   const seekTo = (next) => {
      const v = clamp(next, 0, maxStart);
      setStart(v);
      if (audioRef.current) audioRef.current.currentTime = v;
   };

   const onPointerDown = (e) => {
      if (!canDrag) return;
      dragRef.current = { startX: e.clientX, startAt: start };
      e.preventDefault();
   };

   // Window-level drag listeners so the gesture continues outside the track.
   useEffect(() => {
      const move = (e) => {
         if (!dragRef.current || !pxPerSec) return;
         const delta = e.clientX - dragRef.current.startX;
         seekTo(dragRef.current.startAt - delta / pxPerSec);
      };
      const up = () => {
         dragRef.current = null;
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      return () => {
         window.removeEventListener('pointermove', move);
         window.removeEventListener('pointerup', up);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pxPerSec, maxStart]);

   const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
         audio.pause();
         setPlaying(false);
      } else {
         audio.currentTime = start;
         audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
      }
   };

   // Loop preview within [start, start + clipLen] and drive the playhead.
   useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const onTime = () => {
         setCursor(audio.currentTime);
         if (audio.currentTime >= start + clipLen) {
            audio.currentTime = start;
         }
      };
      const onEnded = () => setPlaying(false);
      audio.addEventListener('timeupdate', onTime);
      audio.addEventListener('ended', onEnded);
      return () => {
         audio.removeEventListener('timeupdate', onTime);
         audio.removeEventListener('ended', onEnded);
      };
   }, [start, clipLen]);

   // Stop audio on unmount.
   useEffect(() => {
      const audio = audioRef.current;
      return () => {
         if (audio) audio.pause();
      };
   }, []);

   const playheadX =
      playing && pxPerSec ? center + (cursor - start) * pxPerSec : null;

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

         {/* Zoomed, scrolling waveform track */}
         <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            className={`relative h-24 bg-[#0f0f0f] rounded-lg overflow-hidden select-none ${
               canDrag ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
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
                  {/* Scrolling strip (only transform changes while scrubbing) */}
                  <div
                     className='absolute top-0 bottom-0 left-0 will-change-transform'
                     style={{ transform: `translateX(${translateX}px)` }}
                  >
                     {bars}
                  </div>

                  {/* Fixed 15s highlight: center -> right edge */}
                  <div
                     className='absolute top-0 bottom-0 bg-purple-500/15 border-r border-purple-500/50 pointer-events-none'
                     style={{ left: `${center}px`, width: `${highlightWidth}px` }}
                  />
                  {/* Fixed center start line */}
                  <div
                     className='absolute top-0 bottom-0 w-[2px] bg-purple-400 pointer-events-none'
                     style={{ left: `${center}px` }}
                  />
                  {/* Playhead (during preview) */}
                  {playheadX != null && (
                     <div
                        className='absolute top-0 bottom-0 w-[2px] bg-white/90 pointer-events-none'
                        style={{ left: `${playheadX}px` }}
                     />
                  )}
               </>
            )}
         </div>

         {/* Readout */}
         <div className='text-center text-xs text-gray-300'>
            <span className='tabular-nums'>
               {fmt(start)} → {fmt(start + clipLen)}
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
               onClick={() => onConfirm(start)}
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
