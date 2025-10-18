'use client';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { animated } from 'react-spring';
import usePurpleHover from '../hooks/usePurpleHover';

const toIntPrecision = (num, n) => {
   return Math.trunc(num * Math.pow(10, n)) / Math.pow(10, n);
};

const CoffeeComponent = () => {
   const [setIsHover, hoverAnimate] = usePurpleHover();

   const lastDrank = useRef(null);
   const [showCoffee, setShowCoffee] = useState(false);
   const coffeeInterval = useRef(null);

   const getCoffeeInterval = (today, last) => {
      let diff = today - last;
      let day = 86400000;
      let daysSinceCoffee = toIntPrecision(diff / day, 6);
      lastDrank.current = toIntPrecision(daysSinceCoffee, 6);
      if (showCoffee)
         document.getElementById('last-drank').textContent = lastDrank.current;
      coffeeInterval.current = setInterval(() => {
         lastDrank.current += toIntPrecision(100 / 86400000, 6);
         if (document.getElementById('last-drank'))
            document.getElementById('last-drank').textContent =
               lastDrank.current.toPrecision(4) + ' Days';
      }, 100);
   };

   useEffect(() => {
      fetch('/api/get-last-coffee-date', {
         cache: 'no-store',
      })
         .then((resp) => resp.json())
         .then((json) => {
            setShowCoffee(true);
            let ts = json.last_drank;
            ts = new Date(ts);
            getCoffeeInterval(Date.now(), ts);
         });

      return () => {
         if (coffeeInterval.current) clearInterval(coffeeInterval.current);
      };
   }, []);

   return (
      <animated.div
         style={hoverAnimate}
         onMouseEnter={() => setIsHover(true)}
         onMouseLeave={() => setIsHover(false)}
         className={`w-full h-full bg-[#101010] ${
            showCoffee ? '' : 'animate-pulse'
         } rounded-md py-4 px-2 flex flex-col items-start`}
      >
         <FontAwesomeIcon className='text-6xl pl-2 pt-4' icon={faCoffee} />
         {showCoffee ? (
            <div className='w-full pl-2 flex flex-wrap'>
               <h1
                  id='last-drank'
                  className='text-lg 2xl:text-xl font-bold'
               ></h1>
               <p className='text-base 2xl:text-lg text-gray-400 font-iight'>
                  Without drinking Coffee
               </p>
            </div>
         ) : (
            <></>
         )}
      </animated.div>
   );
};

export default CoffeeComponent;
