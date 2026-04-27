import Head from 'next/head';
import React from 'react';
import Footer from '@/components/Footer/Footer.js';
import Header from '@/components/Header/Header.js';
import Navbar from '@/components/NavBar/Navbar';
import MusicPageClient from '@/components/MusicPageClient';

export const dynamic = 'force-dynamic';

const MusicPage = () => {
   return (
      <>
         <Head>
            <title>AngelFolio | Music</title>
            <meta
               name='description'
               content="Angel's Song of the Day calendar"
            />
            <meta
               name='viewport'
               content='width=device-width, initial-scale=1'
            />
            <meta
               name='image'
               content='https://www.angel1254.com/link-image.png'
            />
            <meta
               property='og:image'
               content='https://www.angel1254.com/link-image.png'
            />
            <meta name='twitter:card' content='summary_large_image'></meta>
            <link rel='icon' href='/favicon.ico' />
         </Head>
         <main className='w-full flex flex-col items-center'>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
               <Navbar />
               <Header title={'Music'} subtitle="I don't make music, this is just what I've been listening to recently." />
            </div>
            <MusicPageClient />
            <Footer />
         </main>
      </>
   );
};

export default MusicPage;
