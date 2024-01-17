import React from 'react';
import ProjectEdit from '@/components/Admin/ProjectEdit';
export const revalidate = 3600

const page = async ({ params }) => {
   return (
      <>
         <ProjectEdit />
      </>
   );
};

export default page;
