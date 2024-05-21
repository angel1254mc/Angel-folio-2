'use client';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultCover from '../../../public/default-music-cover.png';
import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import usePurpleHover from '../hooks/usePurpleHover';
import { animated } from '@react-spring/web';
import { clampWords } from '../typography/utils';

const SpotifyComponent = () => {
   const [setIsHover, hoverAnimate] = usePurpleHover();
   const [spotifyObj, setSpotifyObj] = useState({});

   const mapArtists = useCallback(
      (artists) => {
         return artists.map((artistObj, index) => {
            if (artists.length == 1 || artists.length - 1 == index)
               return (
                  <a
                     href={artistObj?.external_urls?.spotify ?? ''}
                     key={artistObj.id ? artistObj.id : `some-artist-${index}`}
                  >
                     {artistObj.name}
                  </a>
               );
            else artists.length > 1 && index != artists.length - 1;
            return (
               <a
                  target='_blank'
                  rel='noreferrer'
                  href={artistObj.href}
                  key={artistObj.id}
               >{`${artistObj.name}, `}</a>
            );
         });
      },
      [spotifyObj]
   );

   const getCurrentlyPlaying = async () => {
      const response = await fetch('/api/get-curr-playing',
      { cache: 'no-store' }
      );
      const json = await response.json();
      setSpotifyObj(json);
   };

   useEffect(() => {
      getCurrentlyPlaying();
   }, []);
   return (
      <animated.div
         onMouseOver={() => setIsHover(true)}
         onMouseOut={() => setIsHover(false)}
         style={hoverAnimate}
         className='w-full h-full flex rounded-md bg-[#101010]'
      >
         <div className='w-16 flex flex-col justify-center items-center h-full border-r-[1px] gap-y-1 border-[#242424]'>
            <FontAwesomeIcon
               icon={faGripLines}
               className='text-3xl text-[#242424]'
            />
            <FontAwesomeIcon icon={faSpotify} className='text-[2.5rem]' />
            <FontAwesomeIcon
               icon={faGripLines}
               className='text-3xl text-[#242424]'
            />
         </div>
         <div className='w-full h-full flex pl-3 pr-2 gap-x-2 items-center'>
            <a
               className='min-w-[7rem] min-h-[7rem]'
               target='_blank'
               rel='noreferrer'
               href={spotifyObj?.item?.external_urls?.spotify ?? ''}
            >
               <Image
                  className='w-28 h-28'
                  width={200}
                  height={200}
                  alt={spotifyObj?.item?.name ? spotifyObj.item.name : "Placeholder for no Spotify Songs" }
                  src={
                     spotifyObj && spotifyObj.item
                        ? spotifyObj?.item?.album?.images[0]?.url
                        : defaultCover
                  }
               />
            </a>
            <div className='flex flex-col gap-y-1 pl-1 flex-wrap min-h-[6rem]'>
               <a
                  target='_blank'
                  rel='noreferrer'
                  href={spotifyObj?.item?.external_urls?.spotify ?? ''}
                  className='text-base font-semibold'
               >
                  {spotifyObj?.item?.name
                     ? clampWords(spotifyObj.item.name, 8)
                     : 'Nothing right now!'}
               </a>
               <div className='text-sm'>
                  {mapArtists(spotifyObj?.item?.artists ?? [{ name: '' }], 4)}
               </div>
               <a
                  target='_blank'
                  href={spotifyObj?.item?.album?.external_urls?.spotify ?? ''}
                  rel='noreferrer'
                  className='text-xs font-light'
               >
                  {spotifyObj?.item?.album?.name
                     ? clampWords(spotifyObj.item.album.name, 8)
                     : ''}
               </a>
            </div>
         </div>
      </animated.div>
   );
};

export default SpotifyComponent;
