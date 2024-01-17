import { postSchema } from '@/schema/schemas';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

const splitCommaList = (toolsStr) => {
   if (toolsStr?.length > 0)
      return toolsStr.split(',').map((word) => word.trim());
   return [];
};

const updateTags = async (id, post) => {
   if (!id)
      return {
         message: 'Missing post ID for post tags',
      };
   let { error } = await supabase.from('PostTag').delete().eq('post', id);
   if (error) {
      console.log(
         'There was an Error deleting previous post tags: ' + error.toString()
      );
      return {
         message: 'Error deleting previous tags from post',
         error: error,
      };
   }

   let tags = post.tags.split(",").map(tag => tag.trim());
   for (let i = 0; i < tags.length; i++) {
        console.log(tags[i])
      let result = await supabase
         .from('tags')
         .select('*')
         .eq('tagName', tags[i]);
      if (!result?.data?.length > 0)
         result = await supabase.from('tags').insert({
            created_at: new Date().toISOString().toLocaleString(),
            tagName: tags[i],
         });

      if (result.error) {
         return {
            message: 'Error inserting new tag to tags table',
            error: error,
         };
      }
      result = await supabase
         .from('PostTag')
         .insert({ post: id, tag: tags[i] });
      if (result.error) {
         return {
            message: 'Error inserting new tags to post',
            error: error,
         };
      }
   }

   // If we finished with no errors, return nothing :)
};

export async function POST(request) {
   const post = await request.json();

   let error = postSchema.validate(post);
   if (post.id) {
      error = (
         await supabase
            .from('posts')
            .update({
               // If project ID was sent along with request, we are editing, not creating
               // a new project
               id: post.id,
               created_at: new Date().toISOString().toLocaleString(),
               title: post.title,
               excerpt: post.excerpt,
               content: post.content,
               imageURI: post.imageURI,
               emoji: post.emoji,
               project: post.project,
               slug: post.slug,
               likes: post.likes
            })
            .eq('id', post.id)
      ).error;

      if (error) {
         return NextResponse.json({
            timestamp: Date.now(),
            status: 500,
            error: "Error inserting new post into 'posts' table",
            rawError: error,
            path: '/api/admin/projects',
         });
      }

      error = await updateTags(post.id, post);
   } else {
      const response = await supabase
         .from('posts')
         .insert({
            created_at: new Date().toISOString().toLocaleString(),
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            imageURI: post.imageURI,
            emoji: post.emoji,
            project: post.project,
            slug: post.slug,
            likes: 0,
         })
         .select();

      error = response.error;
      if (!error || !response?.data?.id) {
         return NextResponse.json({
            timestamp: Date.now(),
            status: 500,
            error: "Error inserting new post into 'posts' table",
            rawError: error,
            path: '/api/admin/projects',
         });
      }
      error = await updateTags(response.data.id, post);
   }

   if (error) {
      return NextResponse.json(
         {
            timestamp: Date.now(),
            status: 500,
            error: "Error inserting new post into 'posts' table",
            rawError: error,
            path: '/api/admin/projects',
         },
         { status: 500 }
      );
   }

   return NextResponse.json(
      {
         message: 'Post Creation was successful!',
         link: request.nextUrl.origin.includes('localhost')
            ? `${request.nextUrl.origin}:3000/posts/${post.slug}`
            : process.env`${request.nextUrl.origin}/posts/${post.slug}`,
      },
      {
         status: 200,
      }
   );
}
