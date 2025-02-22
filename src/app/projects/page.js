import Navbar from '@/components/NavBar/Navbar';
import HeadersCustom from '@/components/HeadersCustom';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ProjectList from '@/components/Projects/ProjectList';
import { getAllProjectsSupa } from '@/app/api';

export const revalidate = 15;

const ProjectsIndex = async ({}) => {
   let projects = await getAllProjectsSupa();
   if (!projects || projects.error)
      projects = [
         {
            name: 'Project N/A 🥹',
            desc: 'Looks like there was an error retrieving projects. Drop an issue on the github repo if you see this.',
            github: {
               url: '',
            },
            authors: [],
         },
      ];

   return (
      <>
         <HeadersCustom
            title={'AngelFolio | Projects'}
            description={'Some of my Projects'}
         />
         <main
            className={
               'flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full'
            }
         >
            <Navbar />
            <Header title={'Projects'} />
            <ProjectList projects={projects} />
         </main>
         <Footer></Footer>
      </>
   );
};
export default ProjectsIndex;
