'use client';
import { faGripLines } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';

export const Drawer = ({ open, onClose, children }) => {
   const [dragging, setDragging] = useState(false);
   const [startY, setStartY] = useState(0);

   const [{ y, translateY }, api] = useSpring(() => ({
      y: 0,
      translateY: 100,
      config: { mass: 4, tension: 50, friction: 26 },
   }));

   const handleDrag = (e) => {
      if (e.type === 'mousedown') {
         setDragging(true);

         setStartY(e.clientY);
         api.start({ y: e.clientY });
         return false;
      } else if (e.type === 'mousemove' && dragging) {
         api.start({ y: e.clientY });
      } else if (e.type === 'mouseup' && dragging) {
         setDragging(false);
         if (e.clientY - startY > 200) {
            onClose();
            api.start({ y: window.innerHeight });
         } else {
            api.start({ y: 0 });
         }
      }
      e.preventDefault();
   };

   useEffect(() => {
      if (open) {
         api.start({ y: 0, config: {} });
         api.start({ translateY: 0 });
      } else {
         api.start({ y: window.innerHeight });
         api.start({ translateY: 100 });
      }
   });

   return (
      <>
         <div
            className={`fixed top-0 left-0 w-full h-full z-50 transition-all duration-1000`}
            onMouseMove={handleDrag}
            onMouseUp={handleDrag}
            onClick={onClose}
            aria-hidden='true'
            style={{
               display: open ? 'block' : 'none',
            }}
         ></div>
         <animated.div
            onMouseMove={handleDrag}
            onMouseUp={handleDrag}
            className={`fixed top-0 left-0 min-h-full h-full w-full overflow-auto bg-black z-50 rounded-2xl border-2 border-slate-700`}
            style={{
               y: y.to((val) => val),
               transform: translateY.to((val) => `translateY(${val}%)`),
            }}
         >
            <div
               className='px-4 py-2 w-full text-lg bg-zinc-950 text-center text-gray-800 mb-4 cursor-grab active:cursor-grabbing select-none '
               onMouseDown={handleDrag}
            >
               <FontAwesomeIcon icon={faGripLines} />
            </div>
            {children}
         </animated.div>
      </>
   );
};
