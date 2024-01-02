'use client';
import Link from 'next/link';
import { animated, useSpring } from 'react-spring';
import projectStyles from '@/app/projects/Project.module.css';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';

const Collaborator = ({ author, opacity, transform, isMe = false }) => {
   const [isHover, setIsHover] = useState(false);
   const styles = useSpring({
      config: { mass: 5, tension: 2000, friction: 200 },
      transform: isHover
         ? 'translateY(5px) scale(1.05)'
         : 'translateY(0px) scale(1.0)',
   });
   return (
      <animated.div
         onMouseEnter={() => setIsHover(true)}
         onMouseLeave={() => setIsHover(false)}
         style={{ opacity: opacity, transform: styles.transform }}
         className={
            isMe
               ? projectStyles.collaborator_component_me
               : projectStyles.collaborator_component
         }
      >
         <Link
            href={`https://github.com/${author.github}/`}
            className={projectStyles.collaborator_top}
         >
            <div className={projectStyles.collaborator_name}>
               <>{author.name.split(' ')[0]}</>
               <FontAwesomeIcon
                  icon={faGithub}
                  className={projectStyles.tiny_github}
               />
            </div>
            <Image
               className='w-8 h-8'
               alt={'Profile Image'}
               src={author.image}
               key={author.name}
               height={30}
               width={30}
            />
         </Link>
         <ul className={projectStyles.collaborator_body}>
            {author?.responsibilities ? (
               author?.responsibilities.map((responsibility, index) => {
                  return (
                     <li key={`responsibility-${index}`}>{responsibility}</li>
                  );
               })
            ) : (
               <></>
            )}
         </ul>
      </animated.div>
   );
};

export default Collaborator;
