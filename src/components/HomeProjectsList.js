import React, { useEffect, useRef, useState } from 'react';

import styles from '../styles/components/HomeProjectsList.module.css';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { useTrail, useSpring, animated, useGesture } from 'react-spring';
import { ProjectCard } from './ProjectCard';

const HomeProjectsList = ({
   dynamic = false,
   open = false,
   innerRef,
   projects = null,
}) => {
   const isDynamic = useRef(dynamic);
   const parallax = useRef(0);
   const [stayOpen, setStayOpen] = useState(false);
   const trail = useTrail(projects.length < 3 ? projects.length : 3, {
      config: { mass: 5, tension: 2000, friction: 200 },
      opacity: stayOpen ? 1 : 0,
      x: stayOpen ? 0 : 20,
      height: stayOpen ? 110 : 0,
      from: { opacity: 0, x: 20, height: 0 },
   });

   useEffect(() => {
      if (open) setStayOpen(true);
   }, [open]);

   const props = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      boxShadow: '0px 0px 105px 3px rgba(46,147,255,0.0)',
      transform: 'scale(1.1)',
   });

   useEffect(() => {}, []);
   return (
      <div ref={innerRef} className={styles.projects_column}>
         {trail.map(({ height, opacity, x }, index) => (
            <ProjectCard
               key={projects[index].name + index}
               height={height}
               opacity={opacity}
               x={x}
               index={index}
               project={projects[index]}
            />
         ))}
      </div>
   );
};

export default HomeProjectsList;
