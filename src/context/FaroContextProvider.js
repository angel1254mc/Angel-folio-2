'use client';
import React from 'react';
import FaroContext from './FaroContext';
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { useEffect } from 'react';
import { useState } from 'react';

const FaroContextProvider = ({ children }) => {
   const [faroState, setFaro] = useState(null);
   useEffect(() => {
      setFaro(
         initializeFaro({
            url: process.env.NEXT_PUBLIC_FARO_URL,
            app: {
               name: 'AngelFolio',
               version: '1.0.0',
               environment: 'production',
            },
            instrumentations: [
               // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
               ...getWebInstrumentations(),
            ],
         })
      );
   }, []);

   return (
      <FaroContext.Provider value={{ faroState }}>
         {children}
      </FaroContext.Provider>
   );
};

export default FaroContextProvider;
