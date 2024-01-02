import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { animated, useSpring } from 'react-spring';
import Image from 'next/image';
import React, { useState } from 'react';
import Link from 'next/link';

const ProjectElement = ({ project, x, opacity, transform }) => {
   const [isHover, setIsHover] = useState(false);
   const hoverAnimate = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      transform: isHover ? 'scale(1.05)' : 'scale(1.0)',
      boxShadow: isHover
         ? '0px 0px 105px 3px rgba(46,147,255,0.25)'
         : '0px 0px 105px 3px rgba(46,147,255,0.00)',
   });
   return (
      <animated.div
         style={{
            opacity: opacity,
            x: x,
            boxShadow: hoverAnimate.boxShadow,
            transform: hoverAnimate.transform,
         }}
         onMouseEnter={() => setIsHover(true)}
         onMouseLeave={() => setIsHover(false)}
         className='project-element-container'
      >
         <div className='project-top-group'>
            <div className='project-name-group'>
               <div className='project-element-name'>{project.name}</div>
               {project?.github?.isPublic ? (
                  <Link
                     href={project.github.url}
                     className='project-github-public'
                  >
                     <p>Public</p>
                     <FontAwesomeIcon
                        className='project-element-github'
                        icon={faGithub}
                     />
                  </Link>
               ) : (
                  <div className='project-github-private'>
                     <p>Private</p>
                     <FontAwesomeIcon
                        className='project-element-github'
                        icon={faGithub}
                     />
                  </div>
               )}
            </div>

            <div className='project-date-group'>{project.date}</div>
         </div>
         <div className='project-element-description'>{project.desc}</div>
         <div className='project-element-tools'>
            {project.tools.map((tool) => {
               return (
                  <div key={tool} className='project-element-tool'>
                     {tool}
                  </div>
               );
            })}
         </div>
         <div className='project-bottom-group'>
            <div className='project-collaborators-group'>
               {project.authors.map((author) => {
                  return (
                     <Image
                        alt={'Profile Image'}
                        src={author.image}
                        key={author.name}
                        height={30}
                        width={30}
                     />
                  );
               })}
            </div>
            <Link
               href={`/projects/${project.slug}`}
               className='project-see-more'
            >
               <p>Read More . . .</p>
            </Link>
         </div>
      </animated.div>
   );
};

export default ProjectElement;
