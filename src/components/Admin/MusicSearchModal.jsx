'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import YouTubeFlow from './YouTubeFlow';

const MusicSearchModal = ({ date, existingSong, onSave, onClose, onDelete }) => {
   const [songQuery, setSongQuery] = useState('');
   const [source, setSource] = useState('deezer'); // 'deezer' | 'youtube'
   const [confirmingDelete, setConfirmingDelete] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [deleteError, setDeleteError] = useState(null);
   const [artistQuery, setArtistQuery] = useState('');
   const [artistSuggestions, setArtistSuggestions] = useState([]);
   const [selectedArtist, setSelectedArtist] = useState('');
   const [showSuggestions, setShowSuggestions] = useState(false);
   const [results, setResults] = useState([]);
   const [offset, setOffset] = useState(0);
   const [hasMore, setHasMore] = useState(false);
   const [searching, setSearching] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);
   const [saving, setSaving] = useState(false);
   const [saveError, setSaveError] = useState(null);
   const songDebounceRef = useRef(null);
   const artistDebounceRef = useRef(null);
   const artistInputRef = useRef(null);
   const suggestionsRef = useRef(null);
   const songReqIdRef = useRef(0);
   const artistReqIdRef = useRef(0);

   // Core fetch — used for both fresh searches and load-more
   const fetchSongs = useCallback(
      async (q, artist, pageOffset, append = false) => {
         if (!q.trim() && !artist) {
            setResults([]);
            setHasMore(false);
            return;
         }
         const id = ++songReqIdRef.current;
         append ? setLoadingMore(true) : setSearching(true);
         try {
            const params = new URLSearchParams();
            if (q.trim()) params.set('q', q);
            if (artist) params.set('artist', artist);
            if (pageOffset) params.set('offset', pageOffset);
            const res = await fetch(`/api/admin/music/search?${params}`);
            const json = await res.json();
            if (id !== songReqIdRef.current) return; // stale response
            const incoming = json.results || [];
            setResults((prev) => (append ? [...prev, ...incoming] : incoming));
            setHasMore(pageOffset + incoming.length < (json.total ?? 0));
         } finally {
            if (id === songReqIdRef.current) {
               append ? setLoadingMore(false) : setSearching(false);
            }
         }
      },
      []
   );

   // Fresh search whenever query/artist changes — reset offset
   useEffect(() => {
      setOffset(0);
      clearTimeout(songDebounceRef.current);
      songDebounceRef.current = setTimeout(
         () => fetchSongs(songQuery, selectedArtist, 0, false),
         400
      );
      return () => clearTimeout(songDebounceRef.current);
   }, [songQuery, selectedArtist, fetchSongs]);

   const loadMore = () => {
      const nextOffset = offset + 12;
      setOffset(nextOffset);
      fetchSongs(songQuery, selectedArtist, nextOffset, true);
   };

   // Artist autocomplete
   const searchArtists = useCallback(async (q) => {
      if (!q.trim()) {
         setArtistSuggestions([]);
         return;
      }
      const id = ++artistReqIdRef.current;
      const params = new URLSearchParams({ mode: 'artists', q });
      const res = await fetch(`/api/admin/music/search?${params}`);
      const json = await res.json();
      if (id !== artistReqIdRef.current) return; // stale response
      setArtistSuggestions(json.artists || []);
   }, []);

   useEffect(() => {
      if (selectedArtist && artistQuery === selectedArtist) return; // already committed
      clearTimeout(artistDebounceRef.current);
      artistDebounceRef.current = setTimeout(
         () => searchArtists(artistQuery),
         300
      );
      return () => clearTimeout(artistDebounceRef.current);
   }, [artistQuery, selectedArtist, searchArtists]);

   // Close suggestions on outside click
   useEffect(() => {
      const handler = (e) => {
         if (
            !artistInputRef.current?.contains(e.target) &&
            !suggestionsRef.current?.contains(e.target)
         ) {
            setShowSuggestions(false);
         }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
   }, []);

   const commitArtist = (name) => {
      setSelectedArtist(name);
      setArtistQuery(name);
      setArtistSuggestions([]);
      setShowSuggestions(false);
   };

   const clearArtist = () => {
      setSelectedArtist('');
      setArtistQuery('');
      setArtistSuggestions([]);
      artistInputRef.current?.focus();
   };

   const handlePick = async (song) => {
      setSaving(true);
      setSaveError(null);
      try {
         const res = await fetch('/api/admin/music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, ...song }),
         });
         const json = await res.json().catch(() => ({}));
         if (!res.ok) {
            setSaveError(json.error || 'Failed to save song.');
            return;
         }
         if (json.song) {
            onSave(json.song);
         }
      } catch {
         setSaveError('Network error while saving song.');
      } finally {
         setSaving(false);
      }
   };

   const handleRemove = async () => {
      setDeleting(true);
      setDeleteError(null);
      try {
         const res = await fetch(
            `/api/admin/music?date=${encodeURIComponent(date)}`,
            { method: 'DELETE' }
         );
         const json = await res.json().catch(() => ({}));
         if (!res.ok) {
            setDeleteError(json.error || 'Failed to remove song.');
            return;
         }
         onDelete(date);
      } catch {
         setDeleteError('Network error while removing song.');
      } finally {
         setDeleting(false);
      }
   };

   return (
      <div
         className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
         onMouseDown={(e) => {
            // Close only on a deliberate press that starts on the backdrop —
            // not when a drag (e.g. scrubbing the waveform) is released outside
            // the modal, which would otherwise fire a click on this backdrop.
            if (e.target === e.currentTarget) onClose();
         }}
      >
         <div className='bg-[#151515] rounded-xl w-full max-w-lg mx-4 p-5 flex flex-col gap-4 h-[80vh]'>
            {/* Header */}
            <div className='flex items-center justify-between'>
               <h3 className='text-lg font-semibold'>
                  Pick a song for{' '}
                  <span className='text-purple-400'>{date}</span>
               </h3>
               <button
                  onClick={onClose}
                  className='text-gray-400 hover:text-white text-xl leading-none'
               >
                  ×
               </button>
            </div>

            {/* Source toggle */}
            <div className='flex gap-1 bg-[#0f0f0f] border border-[#262626] rounded-lg p-1'>
               <button
                  type='button'
                  onClick={() => setSource('deezer')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                     source === 'deezer'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                  }`}
               >
                  Deezer
               </button>
               <button
                  type='button'
                  onClick={() => setSource('youtube')}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                     source === 'youtube'
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white'
                  }`}
               >
                  YouTube
               </button>
            </div>

            {source === 'youtube' && (
               <YouTubeFlow date={date} onSave={onSave} />
            )}

            {/* Existing pick */}
            {existingSong && (
               <div className='flex flex-col gap-2 p-3 rounded-lg bg-[#1a1a1a] border border-purple-500/40'>
                  <div className='flex items-center gap-3'>
                     <img
                        src={existingSong.artwork_url}
                        alt={existingSong.title}
                        className='w-12 h-12 rounded object-cover flex-shrink-0'
                     />
                     <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>
                           {existingSong.title}
                        </p>
                        <p className='text-xs text-gray-400 truncate'>
                           {existingSong.artist}
                        </p>
                     </div>
                     {!confirmingDelete && (
                        <button
                           type='button'
                           onClick={() => {
                              setDeleteError(null);
                              setConfirmingDelete(true);
                           }}
                           className='flex-shrink-0 p-1 text-gray-400 hover:text-red-400 transition-colors'
                           aria-label='Remove song'
                           title='Remove song'
                        >
                           <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='w-4 h-4'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                              strokeWidth={2}
                           >
                              <path
                                 strokeLinecap='round'
                                 strokeLinejoin='round'
                                 d='M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-7 0v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7'
                              />
                           </svg>
                        </button>
                     )}
                  </div>

                  {confirmingDelete && (
                     <div className='flex items-center justify-between gap-2 pt-1'>
                        <span className='text-xs text-gray-300'>
                           Remove this song? This deletes the saved snippet.
                        </span>
                        <div className='flex gap-2 flex-shrink-0'>
                           <button
                              type='button'
                              onClick={() => setConfirmingDelete(false)}
                              disabled={deleting}
                              className='text-xs px-2 py-1 rounded bg-[#242424] text-gray-300 hover:text-white disabled:opacity-50'
                           >
                              Cancel
                           </button>
                           <button
                              type='button'
                              onClick={handleRemove}
                              disabled={deleting}
                              className='text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white disabled:opacity-50'
                           >
                              {deleting ? 'Removing…' : 'Remove'}
                           </button>
                        </div>
                     </div>
                  )}

                  {deleteError && (
                     <p className='text-xs text-red-400'>{deleteError}</p>
                  )}
               </div>
            )}

            {source === 'deezer' && (
               <>
                  {/* Search fields */}
                  <div className='flex flex-col gap-2'>
                     {/* Artist combobox */}
                     <div className='relative'>
                        <div className='relative flex items-center'>
                           <input
                              ref={artistInputRef}
                              type='text'
                              placeholder='Filter by artist (optional)'
                              value={artistQuery}
                              onChange={(e) => {
                                 setArtistQuery(e.target.value);
                                 setSelectedArtist('');
                                 setShowSuggestions(true);
                              }}
                              onFocus={() =>
                                 artistSuggestions.length > 0 &&
                                 setShowSuggestions(true)
                              }
                              className='w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors pr-8'
                           />
                           {artistQuery && (
                              <button
                                 onClick={clearArtist}
                                 className='absolute right-2 text-gray-500 hover:text-white text-base leading-none'
                                 tabIndex={-1}
                              >
                                 ×
                              </button>
                           )}
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && artistSuggestions.length > 0 && (
                           <ul
                              ref={suggestionsRef}
                              className='absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-[#303030] rounded-lg overflow-hidden shadow-xl'
                           >
                              {artistSuggestions.map((name) => (
                                 <li
                                    key={name}
                                    onMouseDown={() => commitArtist(name)}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors
                      ${
                         selectedArtist === name
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'hover:bg-[#242424] text-gray-200'
                      }`}
                                 >
                                    {name}
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>

                     {/* Song title search */}
                     <input
                        type='text'
                        placeholder='Search for a song...'
                        value={songQuery}
                        onChange={(e) => setSongQuery(e.target.value)}
                        className='w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
                        autoFocus
                     />
                  </div>

                  {/* Save error */}
                  {saveError && (
                     <p className='text-sm text-red-400 text-center'>{saveError}</p>
                  )}

                  {/* Results */}
                  <div className='overflow-y-auto flex-1 min-h-0'>
                     {!songQuery.trim() && !selectedArtist && results.length === 0 && !searching && !saving ? (
                        <div className='h-full flex flex-col items-center justify-center gap-3 text-gray-500'>
                           <svg className='w-12 h-12 opacity-40' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                              <path strokeLinecap='round' strokeLinejoin='round' d='m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z' />
                           </svg>
                           <p className='text-sm'>Search for a song or filter by artist</p>
                           <p className='text-xs text-gray-600'>Results will appear here</p>
                        </div>
                     ) : (
                        <>
                           {searching && (
                              <p className='text-center text-gray-500 text-sm py-4'>
                                 Searching...
                              </p>
                           )}
                           {saving && (
                              <p className='text-center text-gray-500 text-sm py-4'>
                                 Saving...
                              </p>
                           )}
                           {!searching &&
                              !saving &&
                              results.length === 0 &&
                              (songQuery.trim() || selectedArtist) && (
                                 <p className='text-center text-gray-500 text-sm py-4'>
                                    No results found.
                                 </p>
                              )}
                           {!searching && !saving && (
                              <>
                                 <div className='grid grid-cols-3 gap-2'>
                                    {results.map((song) => (
                                       <button
                                          key={song.id}
                                          onClick={() => handlePick(song)}
                                          className='flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] transition-colors text-left group'
                                       >
                                          <img
                                             src={song.artwork_url}
                                             alt={song.title}
                                             className='w-full aspect-square object-cover rounded'
                                          />
                                          <p className='text-xs font-medium w-full truncate group-hover:text-purple-300 transition-colors'>
                                             {song.title}
                                          </p>
                                          <p className='text-xs text-gray-500 w-full truncate'>
                                             {song.artist}
                                          </p>
                                       </button>
                                    ))}
                                 </div>
                                 {hasMore && (
                                    <button
                                       onClick={loadMore}
                                       disabled={loadingMore}
                                       className='w-full mt-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#303030] text-sm text-gray-400 hover:text-white hover:border-purple-500/40 transition-colors disabled:opacity-50'
                                    >
                                       {loadingMore ? 'Loading...' : 'Load more'}
                                    </button>
                                 )}
                              </>
                           )}
                        </>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default MusicSearchModal;
