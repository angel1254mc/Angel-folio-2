'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../Snackbars';

export const LoginErrorListener = () => {
   const searchParams = useSearchParams();
   const [openSnack, setOpenSnack] = useState(false);

   useEffect(() => {
      const error = searchParams.get('error');
      if (error) {
         setOpenSnack(true);
      }
   }, [searchParams]);

   return (
      <ErrorSnackbar
         open={openSnack}
         message={searchParams.get('error')}
         onClose={() => setOpenSnack(false)}
      />
   );
};
