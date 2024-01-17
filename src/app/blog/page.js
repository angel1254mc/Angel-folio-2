import Navbar from '@/components/NavBar/Navbar';
import Header from '@/components/Header/Header';
import BlogList from '@/components/Blog/BlogList';
import { getAllPostsSupa } from '@/app/api';
import HeadersCustom from '@/components/HeadersCustom';
import Footer from '@/components/Footer/Footer';
export const dynamic = 'force-dynamic';
export const revalidate = 30

const index = async () => {
   const posts = (await getAllPostsSupa()).map((post) => post.meta);
   return (
      <>
         <HeadersCustom title={'Posts by Tag'} />
         <main className='flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full'>
            <Navbar />
            <Header title={'Blog'} />
            <BlogList posts={posts} />
         </main>
         <Footer />
      </>
   );
};

export default index;
