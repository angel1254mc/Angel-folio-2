import { createClient } from '@supabase/supabase-js';
import React from 'react';
import PostEdit from '@/components/Admin/PostEdit';
import { getPostById } from '@/app/api';

export const revalidate = 0;

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

const retrieveTags = async (postID) => {
    const { data } = await supabase.from ("PostTag").select("tag").eq("post", postID);
    return data.map((dataObj) => dataObj.tag);
};

const Page = async ({ params }) => {
   const slug = params.slug;
   // Check if project with given ID exists. I'd use slugs but slugs can technically be changed (not primary key
   // in database), so I'll opt in for IDs instead.
   let post = await getPostById(slug);
   if (post) {
      post.tags = (await retrieveTags(slug)).join(", ")
      return (
         <>
            <PostEdit defaultPost={post} />
         </>
      );
   } else {
      return <div>Sorryyyyyyyy ID seems to not exist :&apos;(</div>;
   }
};

export default Page;
