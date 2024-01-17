import { createClient } from '@supabase/supabase-js';
import React from 'react';
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

   return (
      <>
         <PostEdit />
      </>
   );
};

export default Page;
