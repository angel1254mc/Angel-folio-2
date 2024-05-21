'use client';
import Image from 'next/image';
import React, { useRef } from 'react';
import FaroImage from '../../../public/faro.webp';
import { useEffect, useContext, useState } from 'react';
import WebVitalsContext from '@/context/WebVitalsContext';

const FaroComponent = () => {
   const [webVitals, setWebVitals] = useState({});
   const [overallRating, setOverallRating] = useState('Loading...');
   const webVitalsInterval = useRef(null);
   const { webVitalsRef } = useContext(WebVitalsContext);
   // One useEffect polls the overarching webVitalsContext to check for new data!
   useEffect(() => {
      if (!webVitalsInterval.current)
         webVitalsInterval.current = setInterval(() => {
            if (Object.keys(webVitalsRef.current) != Object.keys(webVitals))
               setWebVitals({... webVitalsRef.current});
         }, 1000)
   }, [])

   useEffect(() => {
      if (webVitals.FID && webVitals.CLS && webVitals.TTFB && webVitals.FCP) {
         console.log("Pinged THe Overall Rating algo")
         let goodCounter = 0;
         let ratingArr = Object.keys(webVitals).map(
            (metric) => webVitals[metric].rating
         );
         for (let i = 0; i < ratingArr.length; i++) {
            if (ratingArr[i] == 'good') {
               goodCounter++;
            }
         }
         if (goodCounter < 1) {
            setOverallRating('Bruh 💀');
         } else if (goodCounter < 4) {
            setOverallRating('Needs Improvement');
         } else if (goodCounter >= 4) {
            setOverallRating("Lookin' Good!");
         }
      }
   }, [webVitals]);
   return (
      <div className='w-full flex flex-col hover:scale-105 transition-all duration-150 hover:shadow-[0px_0px_105px_3px_rgba(192,77,246,0.25)] bg-[#101010] border-[1px] border-[#101010] rounded-md'>
         <div className='flex gap-x-2 w-full border-b-[1px] mb-1 px-4 py-3 border-b-[#1D1D1D]'>
            <Image
               className='w-6 h-8'
               src={FaroImage}
               loading='eager'
               width={100}
               height={100}
               alt={"Grafana Faro Logo"}
            />
            <div>
               <h1 className='text-sm font-bold'>Site Stats</h1>
               <p className='text-xs font-light'>
                  Powered by Grafana Faro and web-vitals pkg.
               </p>
            </div>
         </div>
         {webVitals.err ? (
            <div>There was an error gathering web vitals 🥲</div>
         ) : (
            <div className='w-full h-full flex py-1 flex-wrap'>
               <div className='w-1/3 flex flex-col gap-y-1 items-center justify-center border-r-[1px] mb-2 border-r-[#1D1D1D] h-20'>
                  <h3 className='text-sm font-bold'>TTFB</h3>
                  <p
                     className={`text-base font-bold pb-2 ${
                        webVitals.TTFB
                           ? webVitals?.TTFB?.rating == 'good'
                              ? 'text-green-500'
                              : webVitals.TTFB.rating == 'poor'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                           : 'text-gray-400'
                     }`}
                  >
                     {webVitals?.TTFB?.value?.toPrecision(5) ?? 'Loading...'}
                  </p>
               </div>
               <div className='w-1/3 flex flex-col gap-y-1 items-center justify-center border-r-[1px] mb-2 border-r-[#1D1D1D] h-20'>
                  <h3 className='text-sm font-bold'>FCP</h3>
                  <p
                     className={`text-base font-bold pb-2 ${
                        webVitals.FCP
                           ? webVitals?.FCP?.rating == 'good'
                              ? 'text-green-500'
                              : webVitals.FCP.rating == 'poor'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                           : 'text-gray-400'
                     }`}
                  >
                     {webVitals?.FCP?.value?.toPrecision(5) ?? 'Loading...'}
                  </p>
               </div>
               <div className='w-1/3 flex flex-col gap-y-1 items-center justify-center h-20 mb-2'>
                  <h3 className='text-sm font-bold'>FID</h3>
                  <p
                     className={`text-base font-bold pb-2 ${
                        webVitals.FID
                           ? webVitals?.FID?.rating == 'good'
                              ? 'text-green-500'
                              : webVitals.FID.rating == 'poor'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                           : 'text-gray-400'
                     }`}
                  >
                     {webVitals?.FID?.value?.toPrecision(5) ?? 'Loading...'}
                  </p>
               </div>
               <div className='w-1/3 flex flex-col gap-y-1 items-center justify-center mb-2 border-r-[1px] border-r-[#1D1D1D] h-20'>
                  <h3 className='text-sm font-bold'>CLS</h3>
                  <p
                     className={`text-base font-bold pb-2 ${
                        webVitals.CLS
                           ? webVitals?.CLS?.rating == 'good'
                              ? 'text-green-500'
                              : webVitals.CLS.rating == 'poor'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                           : 'text-gray-400'
                     }`}
                  >
                     {webVitals?.CLS?.value?.toPrecision(5) ?? 'Loading...'}
                  </p>
               </div>
               <div className='w-2/3 flex flex-col gap-y-1 items-center justify-center h-20 mb-2'>
                  <h3 className='text-sm font-bold'>Overall?</h3>
                  <p
                     className={`text-base font-bold pb-2 ${
                        overallRating != 'Loading...'
                           ? overallRating == "Lookin' Good!"
                              ? 'text-green-500'
                              : 'text-yellow-400'
                           : 'text-gray-400'
                     }`}
                  >
                     {overallRating}
                  </p>
               </div>
            </div>
         )}
      </div>
   );
};

export default FaroComponent;
