'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SnippetPicker from './SnippetPicker';
import SearchStage from './youtube/SearchStage';
import MetadataStage from './youtube/MetadataStage';
import { parseYouTubeTitle } from './ytMetadata';

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
         const params = new URLSearchParams({ q });
         const res = await fetch(`/api/admin/music/yt/search?${params}`);
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

   const applyMatch = (match) =>
      setMeta((m) => ({
         title: match.title || m.title,
         artist: match.artist || m.artist,
         album: match.album || m.album,
         artwork_url: match.artwork_url || m.artwork_url,
      }));

   return (
      <div className='flex flex-col gap-3 flex-1 min-h-0'>
         {error && <p className='text-sm text-red-400 text-center'>{error}</p>}

         {stage === 'search' && (
            <SearchStage
               query={query}
               onQueryChange={setQuery}
               searching={searching}
               results={results}
               onPick={pick}
            />
         )}

         {stage === 'preparing' && (
            <div className='flex-1 flex flex-col items-center justify-center gap-3 text-gray-400'>
               <div className='w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin' />
               <p className='text-sm'>
                  Downloading audio… (waking up service if asleep)
               </p>
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
            <MetadataStage
               meta={meta}
               onChangeField={(field, value) =>
                  setMeta((m) => ({ ...m, [field]: value }))
               }
               onApplyMatch={applyMatch}
               defaultQuery={`${meta.artist} ${meta.title}`.trim()}
               saving={saving}
               onSave={save}
            />
         )}
      </div>
   );
};

export default YouTubeFlow;
