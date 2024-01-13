import { createClient } from '@supabase/supabase-js';
import React from 'react';
import ProjectEdit from '@/components/Admin/ProjectEdit';
import PostEdit from '@/components/Admin/PostEdit';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

const Page = async ({ params }) => {
   const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(posts[0]);
   return (
      <>
         <PostEdit />
      </>
   );
};

export default Page;
