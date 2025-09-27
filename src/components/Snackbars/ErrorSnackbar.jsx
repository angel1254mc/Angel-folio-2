'use client';

import { faWarning, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';

export const ErrorSnackbar = ({ message, open, onClose, closeTimeout }) => {
   const timeoutRef = React.useRef(null);

   useEffect(() => {
      if (open) {
         timeoutRef.current = setTimeout(() => {
            // Close the snackbar in 10 second if no user action taken
            onClose();
         }, closeTimeout ?? 10000);
      }

      return () => {
         clearTimeout(timeoutRef.current);
      };
   }, [open, onClose]);
   return (
      <div
         className={`flex items-center w-full max-w-xs p-4 border-red-500 border-2 gap-x-2 rounded-lg shadow-sm bg-black transition-all duration-100  ${
            open ? 'opacity-1 translate-y-0' : 'opacity-0 translate-y-4'
         }`}
         role='alert'
      >
         <div class='inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg text-white border-gray-500 border-[1px] bg-gray-800 hover:bg-gray-900'>
            <FontAwesomeIcon icon={faWarning} />
            <span class='sr-only'>Warning icon</span>
         </div>
         <div class='ms-3 text-sm font-normal'>{message}</div>
         <button
            type='button'
            className='ms-auto -mx-1.5 -my-1.5  text-gray-400 bg-gray-800 hover:bg-gray-900 rounded-lg p-2 flex flex-row items-center content-center  '
            onClick={onClose}
            aria-label='Close'
         >
            <span class='sr-only'>Close</span>
            <FontAwesomeIcon
               className='w-4 h-4 text-sm text-white'
               icon={faX}
            />
         </button>
      </div>
   );
};
