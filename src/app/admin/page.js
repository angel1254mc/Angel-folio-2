import Header from '@/components/Header/Header';
import Navbar from '@/components/NavBar/Navbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <>
      <main className='w-full flex flex-col items-center'>
        <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
          <Navbar />
          <Header title={'Dashboard'} />
          <div className='flex flex-col gap-y-4 mt-4'>
            <Link
              href='/admin/coffee'
              className='px-4 py-2 border-white border-[1px] rounded-md text-white font-semibold w-fit'
            >
              Coffee Timer ☕
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
