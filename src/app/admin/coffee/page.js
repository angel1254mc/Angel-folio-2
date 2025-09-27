import { ResetCoffeeButton } from '@/components/ResetCoffeeButton/ResetCoffeeButton';
import React from 'react';
export const revalidate = 3600;

const page = async ({ params }) => {
   return (
      <>
         <ResetCoffeeButton />
      </>
   );
};

export default page;
