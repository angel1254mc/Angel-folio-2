import Link from 'next/link';
import Navbar from '@/components/NavBar/Navbar';
import Header from '@/components/Header/Header';

export default function NotFound() {
  return (
    <main className='flex flex-col pt-2 px-6 max-w-[50rem] align-center m-auto min-h-[600px] w-full'>
      <Navbar />
      <Header title={'404'} />
      <p className='text-white mt-2'>
        This page doesn&apos;t exist.{' '}
        <Link href='/' className='underline underline-offset-2'>
          Go home
        </Link>
      </p>
    </main>
  );
}
