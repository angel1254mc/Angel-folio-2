'use client';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import HeadersCustom from '@/components/HeadersCustom';
import Navbar from '@/components/NavBar/Navbar';
import Image from 'next/image';
import { VinylLore } from './VinylLore';
import { useState } from 'react';
import { Drawer } from '@/components/UI/Drawer';
const Music = () => {
   const [activeIndex, setActiveIndex] = useState(null);
   const [albumInDrawer, setAlbumInDrawer] = useState(null);

   const albums = [
      {
         albumCoverURL: 'https://i.imgur.com/tlT3EE9.jpeg',
         name: 'Time Falls Like Moonlight',
         artist: 'City Girl',
         audioURL: '/audio/time-falls-like-moonlight.mp3',
      },
      {
         albumCoverURL: 'https://i.imgur.com/x072Scp.jpeg',
         name: 'Neon Impasse',
         artist: 'City Girl',
         audioURL: '/audio/neon-impasse.mp3',
      },
      {
         albumCoverURL: 'https://i.imgur.com/nLDSidi.jpeg',
         name: 'Chroma Velocity',
         artist: 'City Girl',
         audioURL: '/audio/chroma-velocity.mp3',
      },
      {
         albumCoverURL: 'https://i.imgur.com/VYXQ3Kl.jpeg',
         name: 'Snow Rose',
         artist: 'City Girl',
         audioURL: '/audio/snow-rose.mp3',
      },
   ];

   return (
      <div className={`max-h-[100vh] ${'overflow-y-auto'} overflow-x-hidden`}>
         <HeadersCustom
            title={'AngelFolio | Music'}
            description={'Hidden page :shhhh:'}
         />
         <main
            className={`flex flex-col pt-2 px-6 items-center m-auto min-h-[600px] w-full relative`}
         >
            <Drawer
               open={activeIndex !== null && albumInDrawer}
               onClose={() => {
                  setActiveIndex(null);
               }}
            >
               {albumInDrawer && (
                  <div className='flex flex-col items-center gap-4'>
                     <Image
                        src={albumInDrawer?.albumCoverURL}
                        width={300}
                        height={300}
                        alt='album cover'
                     />
                     <h1 className='text-2xl font-bold'>
                        {albumInDrawer?.name}
                     </h1>
                     <h2 className='text-lg'>{albumInDrawer?.artist}</h2>
                     {[...Array(100)].map((_, i) => (
                        <h1 key={i}>element - {i}</h1>
                     ))}
                  </div>
               )}
            </Drawer>
            <div className='flex flex-col max-w-[50rem] align-center'>
               <Navbar />
               <Header size={'3rem'} title={'my favorite music'} />
            </div>
            <div className='relative flex w-3/4 flex-wrap justify-center gap-8 overflow-y-visible'>
               {albums.map((album, index) => (
                  <VinylLore
                     index={index}
                     album_object={album}
                     onAnimationEnd={({ album, state }) =>
                        state === 'active'
                           ? setAlbumInDrawer(album)
                           : setAlbumInDrawer(null)
                     }
                     active={activeIndex === index}
                     setActive={(e) =>
                        e ? setActiveIndex(index) : setActiveIndex(null)
                     }
                  />
               ))}

               <div className='absolute right-0 h-full w-[50px] bg-gradient-to-r from-transparent to-black'></div>
            </div>
            <Header size={'3rem'} title={'my wishlist'} />
         </main>
         <Footer></Footer>
      </div>
   );
};

export default Music;
