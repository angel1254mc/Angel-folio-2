'use client';
import {
   faAngleDoubleDown,
   faAngleDoubleRight,
   faCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Sheen from '../typography/Sheen';
import Image from 'next/image';
import Link from 'next/link';

const WorkItem = ({
   company,
   role,
   duration,
   logoPath,
   logoClassName,
   logoAlt,
}) => {
   return (
      <div className='w-full flex gap-x-3 h-auto items-start'>
         <FontAwesomeIcon
            className='text-[0.50rem] pt-[0.75rem] 2xl:pt-[1rem] pl-4'
            icon={faCircle}
         />
         <div className='flex flex-col pt-1 flex-wrap gap-y-1'>
            <h1 className='text-base 2xl:text-xl font-semibold'>{company}</h1>
            <p className='text-xs 2xl:text-sm'>{role}</p>
            <p className='text-xs 2xl:text-sm'>{duration}</p>
            <div className='flex gap-x-4 items-center'>
               <Link
                  href='/resume'
                  className='py-1 mt-2 px-4 border-[1px] rounded-sm border-white'
               >
                  Read More{' '}
                  <FontAwesomeIcon
                     className='text-xs 2xl:text-sm'
                     icon={faAngleDoubleRight}
                  />
               </Link>
               <Image
                  className={logoClassName ?? 'w-7 h-7'}
                  width='92'
                  height='72'
                  loading='eager'
                  src={logoPath}
                  alt={logoAlt ?? company + ' logo'}
               />
            </div>
         </div>
      </div>
   );
};

const WorkComponent = () => {
   const [expanded, setExpanded] = useState(false);

   return (
      <div
         className={`w-full rounded-md flex flex-col absolute hover:scale-[103%] hover:border-white bg-[#101010] h-full transition-all duration-150 overflow-y-hidden max-h-[24rem] border-2 z-10 ${
            !expanded
               ? 'md:max-h-[11.5rem] 2xl:max-h-[13.5rem] md:border-2 md:border-transparent '
               : 'md:max-h-[24rem] 2xl:max-h-[28rem] border-2'
         }`}
      >
         <div className='w-full text-xl 2xl:text-2xl font-bold pt-3 px-3 flex justify-between items-center'>
            <h1>Where I&apos;ve Worked</h1>
            <button onClick={() => setExpanded((state) => !state)}>
               <FontAwesomeIcon
                  className={`transition-all duration-150 text-xl 2xl:text-2xl md:flex hidden text-gray-500 ${
                     expanded ? 'rotate-180' : ''
                  }`}
                  icon={faAngleDoubleDown}
               />
            </button>
         </div>
         <div className='w-full flex flex-col h-full justify-between'>
            <div className='flex flex-col w-full h-full gap-x-1 gap-y-4 md:gap-y-8 pt-1'>
               <WorkItem
                  company={'ALTR'}
                  role={'Frontend Engineer'}
                  duration={'May 2024 - Present'}
                  description={''}
                  logoPath={'/ALTR-logo.png'}
                  logoClassName={`h-5 w-16`}
               />
               <WorkItem
                  company={'Grafana Labs Inc'}
                  role={'Software Engineer Intern'}
                  duration={'June 2023 - Aug 2023'}
                  description={''}
                  logoPath={'/grafana-logo.png'}
               />
            </div>
            <div
               className={`flex pb-8 text-sm 2xl:text-base px-4 h-auto items-start transition-all duration-150 ${
                  expanded ? 'md:opacity-1' : 'md:opacity-0'
               }`}
            >
               <p>
                  For more info on my past work experience, check out my{' '}
                  <a href='https://www.linkedin.com/in/angel1254/'>
                     <Sheen>LinkedIn</Sheen>
                  </a>{' '}
                  or my{' '}
                  <Link href='/resume'>
                     <Sheen>Resume</Sheen>
                  </Link>{' '}
                  page!
               </p>
            </div>
         </div>
      </div>
   );
};

export default WorkComponent;
