import { useState } from 'react';
import { useSpring } from 'react-spring';

const usePurpleHover = () => {
   const [isHover, setIsHover] = useState(false);
   const hoverAnimate = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      transform: isHover ? 'scale(1.05)' : 'scale(1.0)',
      boxShadow: isHover
         ? '0px 0px 105px 3px rgba(192,77,246,0.25)'
         : '0px 0px 105px 3px rgba(192,77,246,0.00)',
   });

   return [setIsHover, hoverAnimate];
};

export default usePurpleHover;
