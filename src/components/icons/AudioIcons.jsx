import React from 'react';

export const PlayIcon = ({ className = 'w-4 h-4' }) => (
   <svg className={className} fill='currentColor' viewBox='0 0 24 24'>
      <path d='M8 5v14l11-7z' />
   </svg>
);

export const PauseIcon = ({ className = 'w-4 h-4' }) => (
   <svg className={className} fill='currentColor' viewBox='0 0 24 24'>
      <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
   </svg>
);

export const LinkIcon = ({ className = 'w-4 h-4' }) => (
   <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
      />
   </svg>
);

export const SpinnerIcon = ({ className = 'w-4 h-4' }) => (
   <svg
      className={`${className} animate-spin`}
      fill='none'
      viewBox='0 0 24 24'
   >
      <circle
         className='opacity-25'
         cx='12'
         cy='12'
         r='10'
         stroke='currentColor'
         strokeWidth='4'
      />
      <path
         className='opacity-75'
         fill='currentColor'
         d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
      />
   </svg>
);

export const SkipNextIcon = ({ className = 'w-4 h-4' }) => (
   <svg className={className} fill='currentColor' viewBox='0 0 24 24'>
      <path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z' />
   </svg>
);

export const SkipPrevIcon = ({ className = 'w-4 h-4' }) => (
   <svg className={className} fill='currentColor' viewBox='0 0 24 24'>
      <path d='M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z' />
   </svg>
);

export const ShuffleIcon = ({ className = 'w-4 h-4' }) => (
   <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='M18 4l3 3-3 3M18 20l3-3-3-3M3 7h3a5 5 0 014.5 2.8l1 2.4A5 5 0 0016 15h5M3 17h3a5 5 0 004.5-2.8l1-2.4A5 5 0 0116 9h5'
      />
   </svg>
);

export const RepeatIcon = ({ className = 'w-4 h-4' }) => (
   <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3'
      />
   </svg>
);

export const RepeatOneIcon = ({ className = 'w-4 h-4' }) => (
   <svg className={className} viewBox='0 0 24 24'>
      <path
         fill='none'
         stroke='currentColor'
         strokeWidth={2}
         strokeLinecap='round'
         strokeLinejoin='round'
         d='M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3'
      />
      <text
         x='12'
         y='15.5'
         textAnchor='middle'
         fill='currentColor'
         fontSize='8'
         fontWeight='bold'
         fontFamily='sans-serif'
      >
         1
      </text>
   </svg>
);

export const EditIcon = ({ className = 'w-4 h-4' }) => (
   <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
   >
      <path
         strokeLinecap='round'
         strokeLinejoin='round'
         d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125'
      />
   </svg>
);
