'use client';
import React, { useRef } from 'react';
import WebVitalsContext from './WebVitalsContext';
import { useReportWebVitals } from 'next/web-vitals';

const WebVitalsContextProvider = ({ children }) => {
   const webVitalsRef = useRef(null);
   
   useReportWebVitals((metric) => {
    console.log(metric);
    let newState = { ... webVitalsRef.current };
    newState[metric.name] = metric;
    webVitalsRef.current = newState;
   })

   return (
      <WebVitalsContext.Provider value={{ webVitalsRef }}>
         {children}
      </WebVitalsContext.Provider>
   );
};

export default WebVitalsContextProvider;
