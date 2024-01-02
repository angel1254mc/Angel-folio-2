'use client';

import { Inter } from '@next/font/google';
import Header from '@/components/Header/Header';
import Footer from '../components/Footer/Footer';
import HeadersCustom from '../components/HeadersCustom';
import { useSpring, useTrail, useTransition } from 'react-spring';
import { animated } from 'react-spring';
import IntroComponent from '../components/Home/IntroComponent';
import WorkComponent from '../components/Home/WorkComponent';
import LastStarredRepo from '../components/Home/LastStarredRepo';
import CoffeeComponent from '../components/Home/CoffeeComponent';
import SpotifyComponent from '../components/Home/SpotifyComponent';
import BlogPostComponent from '../components/Home/BlogPostComponent';
import ProjectCardComponent from '../components/Home/ProjectCardComponent';
import SSDComponent from '../components/Home/SSDComponent';
import TwitchComponent from '../components/Home/TwitchComponent';
import FaroComponent from '../components/Home/FaroComponent';
import Navbar from '@/components/NavBar/Navbar';

export default function Home({ posts, projects }) {
   // TODO (@angel1254mc) change pageState useState to global context
   const [headerSpring, headerApi] = useSpring(() => ({
      from: {
         opacity: 0,
      },
      to: {
         opacity: 1,
      },
   }));

   const [trails, api] = useTrail(14, () => ({
      from: {
         opacity: 0,
         scale: 1.03,
      },
      to: {
         opacity: 1,
         scale: 1,
      },
      config: { mass: 5, tension: 2000, friction: 200 },
      delay: 500,
   }));

   return (
      <div className='w-full flex flex-col items-center'>
         <HeadersCustom />
         <main className='w-full flex flex-col items-center '>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
               <Navbar />
               <Header animateStyle={headerSpring} title={'Home'} />
            </div>
         </main>
         <div className='w-full px-8 pb-6 flex justify-center'>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] h-auto flex flex-col gap-y-4'>
               <div className='w-full justify-center flex md:flex-row flex-col md:h-auto md:min-h-[0] min-h-[48rem] gap-x-4 gap-y-4 items-center md:items-start md:gap-y-0'>
                  <animated.div
                     style={trails[0]}
                     className='flex md:flex-1 w-96 2xl:w-[28rem] md:max-w-[24rem] 2xl:max-w-[28rem] h-96 2xl:h-[28rem] bg-[#101010] rounded-md'
                  >
                     <IntroComponent />
                  </animated.div>
                  <div className='flex md:flex-1 w-96 md:max-w-[24rem] 2xl:w-[28rem] 2xl:max-w-[28rem] flex-col relative md:h-96  2xl:h-[28rem] md:min-h-0 min-h-[36rem] gap-y-4'>
                     <animated.div
                        style={trails[1]}
                        className='flex md:flex-1 w-full h-96 2xl:h-[28rem] bg-[#101010] rounded-md'
                     >
                        <WorkComponent />
                     </animated.div>
                     <div className='flex h-[12rem] md:h-auto md:flex-1 w-full gap-x-4'>
                        <animated.div
                           style={trails[2]}
                           className='flex flex-1 h-full bg-[#101010] rounded-md'
                        >
                           <CoffeeComponent />
                        </animated.div>
                        <animated.div
                           style={trails[3]}
                           className='flex flex-1 h-full bg-[#101010] rounded-md'
                        >
                           <LastStarredRepo />
                        </animated.div>
                     </div>
                  </div>
               </div>
               <div className='w-full items-center gap-y-4 md:items-start md:justify-center flex flex-col-reverse md:flex-row gap-x-4'>
                  <div className='flex flex-col gap-y-4 flex-1  w-96 md:max-w-[24rem]'>
                     <animated.h1
                        style={trails[4]}
                        className='text-2xl font-bold'
                     >
                        I&apos;m Listening To...
                     </animated.h1>
                     <animated.div
                        style={trails[5]}
                        className='flex w-full h-44 bg-[#101010] rounded-md'
                     >
                        <SpotifyComponent />
                     </animated.div>
                     <animated.h1
                        style={trails[8]}
                        className='text-2xl font-bold'
                     >
                        Peep The Rest
                     </animated.h1>
                     <div className='flex w-full gap-x-4 h-44'>
                        <animated.div
                           style={trails[10]}
                           className='flex flex-1 h-full bg-[#101010] rounded-md'
                        >
                           <SSDComponent />
                        </animated.div>
                        <animated.div
                           style={trails[11]}
                           className='flex flex-1 h-full bg-[#101010] rounded-md'
                        >
                           <TwitchComponent />
                        </animated.div>
                     </div>
                     <animated.div
                        style={trails[13]}
                        className='flex w-full gap-x-4 h-60 bg-[#101010] rounded-md'
                     >
                        <FaroComponent />
                     </animated.div>
                  </div>
                  <div className='flex flex-col gap-y-4 flex-1 w-96 md:max-w-[24rem]'>
                     <animated.h1
                        style={trails[6]}
                        className='text-2xl font-bold'
                     >
                        Peep The Blog
                     </animated.h1>
                     <animated.div
                        style={trails[7]}
                        className='flex w-full h-48 bg-[#101010] rounded-md'
                     >
                        <BlogPostComponent latest={posts[0]} />
                     </animated.div>
                     <animated.h1
                        style={trails[9]}
                        className='text-2xl font-bold'
                     >
                        Peep The Projects
                     </animated.h1>
                     <animated.div
                        style={trails[12]}
                        className='flex w-full h-48 bg-[#101010] rounded-md'
                     >
                        <ProjectCardComponent project={projects[0]} />
                     </animated.div>
                     <animated.div
                        style={trails[13]}
                        className='flex w-full h-48 bg-[#101010] rounded-md'
                     >
                        <ProjectCardComponent project={projects[1]} />
                     </animated.div>
                  </div>
               </div>
            </div>
         </div>
         <Footer></Footer>
      </div>
   );
}
