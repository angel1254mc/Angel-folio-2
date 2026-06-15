'use client';
import React from 'react';

// YouTube search stage: query input + results list. Stateless — the parent
// owns the query/results and handles selection.
const SearchStage = ({ query, onQueryChange, searching, results, onPick }) => (
   <>
      <input
         type='text'
         placeholder='Search YouTube…'
         value={query}
         onChange={(e) => onQueryChange(e.target.value)}
         className='w-full bg-[#1a1a1a] border border-[#303030] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors'
         autoFocus
      />
      <div className='overflow-y-auto flex-1 min-h-0 flex flex-col gap-2'>
         {searching && (
            <p className='text-center text-gray-500 text-sm py-4'>Searching…</p>
         )}
         {!searching && results.length === 0 && query.trim() && (
            <p className='text-center text-gray-500 text-sm py-4'>
               No results found.
            </p>
         )}
         {results.map((r) => (
            <button
               key={r.videoId}
               type='button'
               onClick={() => onPick(r)}
               className='flex items-center gap-3 p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] transition-colors text-left'
            >
               <img
                  src={r.thumbnail}
                  alt={r.title}
                  className='w-16 h-12 rounded object-cover flex-shrink-0'
               />
               <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{r.title}</p>
                  <p className='text-xs text-gray-500 truncate'>{r.channel}</p>
               </div>
            </button>
         ))}
      </div>
   </>
);

export default SearchStage;
