import Header from '@/components/Header/Header';
import Navbar from '@/components/NavBar/Navbar';
import React from 'react';

const layout = ({ children }) => {
   return (
      <>
         <main className='w-full flex flex-col items-center '>
            <div className='w-full max-w-[50rem] 2xl:max-w-[64rem] flex flex-col justify-start py-2 px-6'>
               <Navbar />
               <Header title={'Coffee Count'} />
            </div>
         </main>
         {children}
      </>
   );
};

export default layout;
