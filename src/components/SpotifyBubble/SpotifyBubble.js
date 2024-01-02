import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { animated, useSpring, config } from 'react-spring';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import styles from './SpotifyBubble.module.css';
import cover from '../../../public/default-music-cover.png';
import { useGesture, useDrag } from '@use-gesture/react';
import { faGrip, faGripLines } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
const SpotifyBubble = ({ trigger }) => {
   const target = useRef(null);
   const [spotifyObj, setSpotifyObj] = useState(null);
   const handleGrabCurrentlyPlaying = async () => {
      const response = await fetch('/api/get-curr-playing');
      const json = await response.json();
      setSpotifyObj(json);
   };

   const mapArtists = (artists) => {
      return artists.map((artistObj, index) => {
         if (artists.length == 1 || artists.length - 1 == index)
            return <div key={artistObj.id}>{artistObj.name}</div>;
         else artists.length > 1 && index != artists.length - 1;
         return <div key={artistObj.id}>{`${artistObj.name}, `}</div>;
      });
   };

   useEffect(() => {
      handleGrabCurrentlyPlaying();
   }, []);

   const [{ x, y, scale }, api] = useSpring(() => ({
      config: config.gentle,
      scale: 1,
      x: 0,
      y: 0,
   }));
   const bind2 = useGesture({
      onHover: ({ hovering }) => api({ scale: hovering ? 1.1 : 1.0 }),
   });
   return (
      <Link
         href={spotifyObj?.item?.external_urls?.spotify ?? ''}
         className={styles.spotify_container}
      >
         <animated.div
            ref={target}
            {...bind2()}
            style={{
               scale: scale,
            }}
            className={styles.currently_listening}
         >
            <div className={styles.spotify_bubble_handle}>
               <FontAwesomeIcon
                  icon={faGripLines}
                  className={styles.drag_handle}
               />
               <FontAwesomeIcon
                  className={styles.spotify_bubble}
                  icon={faSpotify}
               />
               <FontAwesomeIcon
                  icon={faGripLines}
                  className={styles.drag_handle}
               />
            </div>
            <div className={styles.spotify_bubble_content}>
               <Image
                  className={styles.spotify_album_img}
                  width={100}
                  height={100}
                  src={
                     spotifyObj && spotifyObj.item
                        ? spotifyObj?.item?.album?.images[0]?.url
                        : cover
                  }
               />
               <div className={styles.spotify_data_container}>
                  <div className={styles.spotify_song_title}>
                     {spotifyObj?.item?.name ??
                        'Not listening to anything right now!'}
                  </div>
                  <div className={styles.spotify_song_artists}>
                     {mapArtists(spotifyObj?.item?.artists ?? [])}
                  </div>
                  <div className={styles.album_type}>
                     {spotifyObj?.item?.album?.name ?? ''}
                  </div>
               </div>
            </div>
         </animated.div>
      </Link>
   );
};

export default SpotifyBubble;

///<Image draggable={false} onDrag={e => e.preventDefault()} alt={'Spotify bubble svg'} className={styles.spotify_group} src={spotify} height={60} width={60}/>
