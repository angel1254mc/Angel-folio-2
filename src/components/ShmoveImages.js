import Image from 'next/image';
import React, { useEffect, useState } from 'react';
export const ShmoveImages = ({ openTrigger }) => {
   const [triggerChildren, setTriggerChildren] = useState(false);
   const handleShowImages = () => {
      document.getElementsByClassName('image-window')[0].style.maxHeight =
         '200px';
      setTimeout(() => {
         document
            .getElementsByClassName('shmove-image')[0]
            .classList.add('spinIn');
         setTriggerChildren(true);
      }, 1000);
   };

   useEffect(() => {
      if (openTrigger)
         setTimeout(() => {
            handleShowImages();
         }, 100);
   }, [openTrigger]);

   return (
      <div className='image-window'>
         <Image
            className='shmove-image'
            src={'https://i.imgur.com/F63ixRe.jpg'}
            alt='Picture of Angel'
            fill={true}
            priority
         />
      </div>
   );
};
