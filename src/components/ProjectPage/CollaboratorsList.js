'use client';
import projectStyles from '@/app/projects/Project.module.css';
import Collaborator from './Collaborator';
import { useTrail } from 'react-spring';

const CollaboratorsList = ({ authors }) => {
   const trail = useTrail(authors.length, {
      from: { opacity: 0, x: 20, maxHeight: 0, transform: 'translateY(10px)' },
      to: {
         opacity: 1,
         x: 0,
         transform: 'translateY(0px)',
      },
   });
   return (
      <div className={projectStyles.right_container}>
         <div className={projectStyles.collaborators_header}>Collaborators</div>
         <div className={projectStyles.collaborators_body}>
            {trail.map(({ opacity, x, transform }, index) => {
               if (index == 0)
                  return (
                     <Collaborator
                        isMe={true}
                        key={authors[index].name}
                        author={authors[index]}
                        opacity={opacity}
                        transform={transform}
                     />
                  );
               return (
                  <Collaborator
                     key={authors[index].name}
                     author={authors[index]}
                     opacity={opacity}
                     transform={transform}
                  />
               );
            })}
         </div>
      </div>
   );
};

export default CollaboratorsList;
