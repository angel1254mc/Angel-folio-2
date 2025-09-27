'use client';
import { useState } from 'react';
import { ErrorSnackbar, SuccessSnackbar } from '../Snackbars';

export const ResetCoffeeButton = () => {
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const resetCoffeeCounter = async () => {
      try {
         setLoading(true);
         const response = await fetch('/api/admin/coffee', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Empty body for now
         });

         const serverError = response.status !== 200;
         if (serverError) {
            const body = await response.json();
            throw new Error();
         }
         setSuccess(true);
      } catch (error) {
         console.error('Error resetting coffee counter:', error);
         setError(`Error resetting coffee counter`);
      } finally {
         setLoading(false);
      }
   };
   return (
      <div className='flex flex-col justify-center items-center w-full'>
         <button
            disabled={loading}
            onClick={resetCoffeeCounter}
            className='bg-red-500 text-white px-4 py-2 rounded transition-all duration-100 hover:bg-red-700'
         >
            {loading ? 'Resetting...' : 'Reset Coffee Counter'}
         </button>
         <div className='mt-30'>
            <ErrorSnackbar
               message={error}
               open={!!error}
               onClose={() => setError(null)}
            />
            <SuccessSnackbar
               message={'Coffee counter reset successfully!'}
               open={success}
               onClose={() => setSuccess(false)}
            />
         </div>
      </div>
   );
};
