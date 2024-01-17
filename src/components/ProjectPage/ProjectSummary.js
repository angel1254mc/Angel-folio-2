import projectStyles from '@/app/projects/Project.module.css';
import Link from 'next/link';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProjectSummaryComponent = ({ project }) => {
   return (
      <div className={projectStyles.left_container}>
         <div className={projectStyles.project_name}>Name: {project.name}</div>
         <div className={projectStyles.project_summary}>
            <div className={projectStyles.header}>Summary</div>
            <div className={projectStyles.body}>{project.summary}</div>
         </div>
         <div className={projectStyles.project_githubs}>
            <div className={projectStyles.header}>Github(s)</div>
            <div className={projectStyles.githubs_body}>
               {project.github.isPublic ? (
                  <Link
                     href={project.github.url}
                     className={projectStyles.github_link}
                     key={'main-site-key'}
                  >
                     <FontAwesomeIcon icon={faLink} />
                     <div className={projectStyles.link_title}>
                        GitHub Repo
                     </div>
                  </Link>
               ) : (
                  <div>Main Repo not public for this project</div>
               )}
               {project.github.urls.map((urlObj) => {
                  return (
                     <Link
                        href={urlObj.url}
                        className={projectStyles.github_link}
                        key={urlObj.title}
                     >
                        <FontAwesomeIcon icon={faLink} />
                        <div className={projectStyles.link_title}>
                           {urlObj.title}
                        </div>
                     </Link>
                  );
               })}
            </div>
         </div>
         <div className={projectStyles.tech_stack}>
            <div className={projectStyles.header}>Tech Stack</div>
            <div className={projectStyles.tech_body}>
               {project.tools.map((tool) => {
                  return (
                     <div key={tool} className='project-element-tool'>
                        {tool}
                     </div>
                  );
               })}
            </div>
         </div>
         <div className={projectStyles.lessons_learned}>
            <div className={projectStyles.header}>Main Lessons Learned</div>
            <ul className={projectStyles.lessons_learned_body}>
               {project?.lessons?.map((lesson, index) => {
                  return <li key={index}>{lesson}</li>;
               })}
            </ul>
         </div>
      </div>
   );
};

export default ProjectSummaryComponent;
