'use client';
import React, { useEffect, useRef, useState } from 'react';
import { searchDeezer } from '../ytMetadata';

const fieldClass =
   'mt-1 w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500';

// Metadata confirmation stage: editable title/artist/album/artwork fields plus
// a Deezer enrichment search where the user picks a match to fill clean
// metadata. Owns its own Deezer search state; reports edits/picks/save upward.
const MetadataStage = ({
   meta,
   onChangeField,
   onApplyMatch,
   defaultQuery,
   saving,
   onSave,
}) => {
   const [query, setQuery] = useState(defaultQuery || '');
   const [results, setResults] = useState([]);
   const [searching, setSearching] = useState(false);
   const [touched, setTouched] = useState(false);
   const debounceRef = useRef(null);
   const reqIdRef = useRef(0);

   // Debounced Deezer search — only after the user engages the field, so we
   // don't fire an automatic query the moment the stage mounts.
   useEffect(() => {
      if (!touched) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
         const id = ++reqIdRef.current;
         setSearching(true);
         try {
            const found = await searchDeezer(query);
            if (id === reqIdRef.current) setResults(found);
         } finally {
            if (id === reqIdRef.current) setSearching(false);
         }
      }, 400);
      return () => clearTimeout(debounceRef.current);
   }, [query, touched]);

   const canSave = !!meta.title && !!meta.artist && !saving;

   return (
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
               onChange={(e) => onChangeField('title', e.target.value)}
               className={fieldClass}
            />
         </label>
         <label className='text-xs text-gray-400'>
            Artist
            <input
               type='text'
               value={meta.artist}
               onChange={(e) => onChangeField('artist', e.target.value)}
               className={fieldClass}
            />
         </label>
         <label className='text-xs text-gray-400'>
            Album (optional)
            <input
               type='text'
               value={meta.album}
               onChange={(e) => onChangeField('album', e.target.value)}
               className={fieldClass}
            />
         </label>
         <label className='text-xs text-gray-400'>
            Artwork URL
            <input
               type='text'
               value={meta.artwork_url}
               onChange={(e) => onChangeField('artwork_url', e.target.value)}
               className={fieldClass}
            />
         </label>

         {/* Deezer enrichment: search + pick a match to fill clean metadata */}
         <div className='flex flex-col gap-2 pt-2 border-t border-[#242424]'>
            <label className='text-xs text-gray-400'>
               Enrich via Deezer — search and pick a match
               <input
                  type='text'
                  value={query}
                  placeholder='e.g. artist + song title'
                  onChange={(e) => {
                     setQuery(e.target.value);
                     setTouched(true);
                  }}
                  onFocus={() => setTouched(true)}
                  className={fieldClass}
               />
            </label>
            {searching && (
               <p className='text-xs text-gray-500'>Searching Deezer…</p>
            )}
            {!searching && touched && query.trim() && results.length === 0 && (
               <p className='text-xs text-gray-500'>No Deezer matches.</p>
            )}
            {results.length > 0 && (
               <div className='max-h-40 overflow-y-auto flex flex-col gap-1'>
                  {results.map((r) => (
                     <button
                        key={r.id}
                        type='button'
                        onClick={() => onApplyMatch(r)}
                        className='flex items-center gap-2 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] transition-colors text-left'
                     >
                        <img
                           src={r.artwork_url}
                           alt={r.title}
                           className='w-9 h-9 rounded object-cover flex-shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                           <p className='text-xs font-medium truncate'>
                              {r.title}
                           </p>
                           <p className='text-[11px] text-gray-500 truncate'>
                              {r.artist}
                              {r.album ? ` · ${r.album}` : ''}
                           </p>
                        </div>
                     </button>
                  ))}
               </div>
            )}
         </div>

         <button
            type='button'
            onClick={onSave}
            disabled={!canSave}
            className='py-2 rounded-lg bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm'
         >
            {saving ? 'Saving…' : 'Save song of the day'}
         </button>
      </div>
   );
};

export default MetadataStage;
