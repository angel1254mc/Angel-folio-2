import Header from '@/components/Header/Header';
import Navbar from '@/components/NavBar/Navbar';
import { CoffeeWidget } from '@/components/Admin/CoffeeWidget';

export const dynamic = 'force-dynamic';

const page = () => {
   return (
      <>
         <main className='w-full flex flex-col items-center'>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
               <Navbar />
               <Header title={'Dashboard'} />
               <div className='flex flex-col gap-y-6 mt-4'>
                  <CoffeeWidget />
                  <a
                     href='/admin/music'
                     className='px-4 py-2 border-purple-500 border-[1px] rounded-md text-purple-400 font-semibold w-fit hover:bg-purple-500/10 transition-colors'
                  >
                     Song of the Day
                  </a>
                  <form action='/api/auth/logout' method='POST'>
                     <button
                        type='submit'
                        className='px-4 py-2 border-red-400 border-[1px] rounded-md text-red-400 font-semibold w-fit'
                     >
                        Logout
                     </button>
                  </form>
               </div>
            </div>
         </main>
      </>
   );
};

export default page;
