import HeadersCustom from '../../../components/HeadersCustom';
import { getAllPostsSupa, getProjectFromSlugSupa } from '@/app/api';
import BlogList from '@/components/Blog/BlogList';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/NavBar/Navbar';
import Header from '@/components/Header/Header';
import ProjectSummaryComponent from '@/components/ProjectPage/ProjectSummary';
import CollaboratorsList from '@/components/ProjectPage/CollaboratorsList';
import MainAccomplishments from '@/components/ProjectPage/MainAccomplishments';

export const dynamicParams = true;

const ProjectPage = async ({ params }) => {
   // Just slap all of the getStaticProps stuff in here, ignore getStaticPaths
   const unformattedProj = await getProjectFromSlugSupa(params.slug);
   let project = JSON.stringify(unformattedProj);
   // Above function returns the project object, metadata for any related blog posts, and {tentatively} a 'content' var
   // that basically has a mini blog post description of the project
   const projectPosts = (await getAllPostsSupa(params.slug)).map(
      (post) => post.meta
   );
   project = JSON.parse(project);

   return (
      <>
         <HeadersCustom title={`AngelFolio | ${project.name}`} />
         <main
            className={
               'flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full'
            }
         >
            <Navbar />
            <Header title={`Projects/${project.slug}`} size={'3rem'} />
            {project?.accomplishments ? (
               <MainAccomplishments accomplishments={project.accomplishments} />
            ) : (
               <></>
            )}
            <div className='three-two-split'>
               <ProjectSummaryComponent project={project} />
               <CollaboratorsList authors={project.authors} />
            </div>
            <div className={project.blog_list}>
               <Header title={`Related Blog Posts`} size={'3rem'} />
               <BlogList posts={projectPosts} />
            </div>
         </main>
         <Footer></Footer>
      </>
   );
};

export default ProjectPage;
