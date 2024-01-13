import { createClient } from '@supabase/supabase-js';
import React from 'react';
import ProjectEdit from '@/components/Admin/ProjectEdit';

const page = async ({ params }) => {
   return (
      <>
         <ProjectEdit />
      </>
   );
};

export default page;
