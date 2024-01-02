import Link from 'next/link';
import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import styles from '../styles/components/HomeProjectsList.module.css';

export const ProjectCard = ({ height, opacity, x, index, project }) => {
   const [isHover, setIsHover] = useState(false);
   const { boxShadow, transform } = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      transform: isHover ? 'scale(1.05)' : 'scale(1.0)',
      boxShadow: isHover
         ? '0px 0px 105px 3px rgba(46,147,255,0.25)'
         : '0px 0px 105px 3px rgba(46,147,255,0.00)',
   });

   return (
      <Link href={`/projects/${project.slug}`}>
         <animated.div
            style={{
               opacity: opacity,
               x: x,
               boxShadow: boxShadow,
               transform: transform,
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className={styles.project_element}
         >
            <div className={styles.project_name}>
               <p>{project.name}</p>
            </div>
            <div className={styles.project_desc}>{project.desc}</div>
            <div className={styles.project_date}>{project.date}</div>
         </animated.div>
      </Link>
   );
};
