import projectStyles from '@/app/projects/Project.module.css';

const MainAccomplishments = ({ accomplishments }) => {
   return (
      <div className={projectStyles.accomplishments}>
         <ul className={projectStyles.accomplishments_list}>
            {accomplishments.map((accomplishment, index) => {
               return <li key={`accomplishment-${index}`}>{accomplishment}</li>;
            })}
         </ul>
      </div>
   );
};

export default MainAccomplishments;
