import React from 'react';
import PostEdit from '@/components/Admin/PostEdit';

export const revalidate = true

const Page = async ({ params }) => {

   return (
      <>
         <PostEdit />
      </>
   );
};

export default Page;
