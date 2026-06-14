'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SnippetPicker from './SnippetPicker';
import { parseYouTubeTitle, enrichFromDeezer } from './ytMetadata';

const YouTubeFlow = ({ date, onSave }) => {
   // stage: 'search' | 'preparing' | 'picking' | 'metadata'
   const [stage, setStage] = useState('search');
   const [query, setQuery] = useState('');
   const [results, setResults] = useState([]);
   const [searching, setSearching] = useState(false);
   const [error, setError] = useState(null);

   const [selected, setSelected] = useState(null); // chosen search result
   const [job, setJob] = useState(null); // prepare response
   const [clipping, setClipping] = useState(false);
   const [snippet, setSnippet] = useState(null); // { snippet_url, startSec }

   const [meta, setMeta] = useState({
      title: '',
      artist: '',
      album: '',
      artwork_url: '',
   });
   const [enriching, setEnriching] = useState(false);
   const [saving, setSaving] = useState(false);

   const debounceRef = useRef(null);
   const reqIdRef = useRef(0);

   const runSearch = useCallback(async (q) => {
      if (!q.trim()) {
         setResults([]);
         return;
      }
      const id = ++reqIdRef.current;
      setSearching(true);
      setError(null);
      try {
         const res = await fetch(
            `/api/admin/music/yt/search?q=${encodeURIComponent(q)}`
         );
         const json = await res.json().catch(() => ({}));
         if (id !== reqIdRef.current) return;
         if (!res.ok) {
            setError(json.error || 'Search failed');
            setResults([]);
            return;
         }
         setResults(json.results || []);
      } catch {
         if (id === reqIdRef.current) setError('Network error during search');
      } finally {
         if (id === reqIdRef.current) setSearching(false);
      }
   }, []);

   useEffect(() => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(query), 400);
      return () => clearTimeout(debounceRef.current);
   }, [query, runSearch]);

   const pick = async (item) => {
      setSelected(item);
      setStage('preparing');
      setError(null);
      try {
         const res = await fetch('/api/admin/music/yt/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: item.videoId }),
         });
         const json = await res.json().catch(() => ({}));
         if (!res.ok) {
            setError(json.error || 'Failed to prepare audio');
            setStage('search');
            return;
         }
         setJob(json);
         setStage('picking');
      } catch {
         setError('Network error while preparing audio');
         setStage('search');
      }
   };

   const confirmSnippet = async (startSec) => {
      if (!job) return;
      setClipping(true);
      setError(null);
      try {
         const res = await fetch('/api/admin/music/yt/clip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.jobId, startSec }),
         });
         const json = await res.json().catch(() => ({}));
         if (!res.ok) {
            if (res.status === 410) {
               setError('Clip session expired — please pick the song again.');
               setStage('search');
            } else {
               setError(json.error || 'Failed to create snippet');
            }
            return;
         }
         setSnippet({
            snippet_url: json.snippet_url,
            startSec: json.startSec ?? startSec,
         });
         const parsed = parseYouTubeTitle(
            job.title || selected?.title,
            job.channel || selected?.channel
         );
         setMeta({
            title: parsed.title || '',
            artist: parsed.artist || '',
            album: '',
            artwork_url: job.thumbnail || selected?.thumbnail || '',
         });
         setStage('metadata');
      } catch {
         setError('Network error while creating snippet');
      } finally {
         setClipping(false);
      }
   };

   const enrich = async () => {
      setEnriching(true);
      setError(null);
      try {
         const found = await enrichFromDeezer({
            title: meta.title,
            artist: meta.artist,
         });
         if (found) {
            setMeta((m) => ({
               title: found.title || m.title,
               artist: found.artist || m.artist,
               album: found.album || m.album,
               artwork_url: found.artwork_url || m.artwork_url,
            }));
         } else {
            setError('No Deezer match found — keeping current details.');
         }
      } finally {
         setEnriching(false);
      }
   };

   const save = async () => {
      if (!snippet) return;
      setSaving(true);
      setError(null);
      try {
         const res = await fetch('/api/admin/music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               date,
               source: 'youtube',
               snippet_url: snippet.snippet_url,
               snippet_start_sec: snippet.startSec,
               youtube_id: selected?.videoId || null,
               title: meta.title,
               artist: meta.artist,
               album: meta.album,
               artwork_url: meta.artwork_url,
               track_url: selected?.videoId
                  ? `https://www.youtube.com/watch?v=${selected.videoId}`
                  : null,
            }),
         });
         const json = await res.json().catch(() => ({}));
         if (!res.ok) {
            setError(json.error || 'Failed to save song');
            return;
         }
         if (json.song) onSave(json.song);
      } catch {
         setError('Network error while saving');
      } finally {
         setSaving(false);
      }
   };

   const setMetaField = (field) => (e) =>
      setMeta((m) => ({ ...m, [field]: e.target.value }));

   return (
      <div className='flex flex-col gap-3 flex-1 min-h-0'>
         {error && <p className='text-sm text-red-400 text-center'>{error}</p>}

         {stage === 'search' && (
            <>
               <input
                  type='text'
                  placeholder='Search YouTube…'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className='w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
                  autoFocus
               />
               <div className='overflow-y-auto flex-1 min-h-0 flex flex-col gap-2'>
                  {searching && (
                     <p className='text-center text-gray-500 text-sm py-4'>
                        Searching…
                     </p>
                  )}
                  {!searching && results.length === 0 && query.trim() && (
                     <p className='text-center text-gray-500 text-sm py-4'>
                        No results found.
                     </p>
                  )}
                  {results.map((r) => (
                     <button
                        key={r.videoId}
                        onClick={() => pick(r)}
                        className='flex items-center gap-3 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] transition-colors text-left'
                     >
                        <img
                           src={r.thumbnail}
                           alt={r.title}
                           className='w-16 h-12 rounded object-cover flex-shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                           <p className='text-sm font-medium truncate'>
                              {r.title}
                           </p>
                           <p className='text-xs text-gray-500 truncate'>
                              {r.channel}
                           </p>
                        </div>
                     </button>
                  ))}
               </div>
            </>
         )}

         {stage === 'preparing' && (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-gray-400'>
               <div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
               <p className='text-sm'>Downloading audio… (waking up service if asleep)</p>
            </div>
         )}

         {stage === 'picking' && job && (
            <SnippetPicker
               audioUrl={`/api/admin/music/yt/audio/${job.jobId}`}
               durationSec={job.durationSec}
               title={job.title || selected?.title}
               channel={job.channel || selected?.channel}
               thumbnail={job.thumbnail || selected?.thumbnail}
               clipping={clipping}
               onConfirm={confirmSnippet}
               onBack={() => setStage('search')}
            />
         )}

         {stage === 'metadata' && (
            <div className='flex flex-col gap-3 overflow-y-auto flex-1 min-h-0'>
               <div className='flex items-center gap-3'>
                  {meta.artwork_url && (
                     <img
                        src={meta.artwork_url}
                        alt={meta.title}
                        className='w-14 h-14 rounded object-cover flex-shrink-0'
                     />
                  )}
                  <p className='text-xs text-purple-400'>
                     15s snippet ready · confirm the details
                  </p>
               </div>

               <label className='text-xs text-gray-400'>
                  Title
                  <input
                     type='text'
                     value={meta.title}
                     onChange={setMetaField('title')}
                     className='mt-1 w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
                  />
               </label>
               <label className='text-xs text-gray-400'>
                  Artist
                  <input
                     type='text'
                     value={meta.artist}
                     onChange={setMetaField('artist')}
                     className='mt-1 w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
                  />
               </label>
               <label className='text-xs text-gray-400'>
                  Album (optional)
                  <input
                     type='text'
                     value={meta.album}
                     onChange={setMetaField('album')}
                     className='mt-1 w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
                  />
               </label>
               <label className='text-xs text-gray-400'>
                  Artwork URL
                  <input
                     type='text'
                     value={meta.artwork_url}
                     onChange={setMetaField('artwork_url')}
                     className='mt-1 w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500'
                  />
               </label>

               <div className='flex gap-2 pt-1'>
                  <button
                     type='button'
                     onClick={enrich}
                     disabled={enriching}
                     className='px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#303030] text-sm text-gray-300 hover:text-white disabled:opacity-50'
                  >
                     {enriching ? 'Enriching…' : 'Enrich via Deezer'}
                  </button>
                  <button
                     type='button'
                     onClick={save}
                     disabled={saving || !meta.title || !meta.artist}
                     className='flex-1 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm'
                  >
                     {saving ? 'Saving…' : 'Save song of the day'}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default YouTubeFlow;
