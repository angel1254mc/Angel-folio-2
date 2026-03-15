import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

const getSessionId = async (req, params) => {
   const ipAddy = req.headers['x-forwarded-for'] ?? '0.0.0.0';
   const slug = params.slug;
   // use IP Address from header, encrypt using a salt. Don't want to infringe on anyone's privacy or anything
   const currentUserId = createHash('md5')
      .update(ipAddy + process.env.IP_ADDRESS_SALT, 'utf8')
      .digest('hex');
   return slug + '___' + currentUserId;
}

export const GET = async (req, { params }) => {
   let slug = params.slug;
   try {
      const sessionId = getSessionId(req, params);
      const {
         data: [postLikesObj],
      } = await supabase.from('post_likes').select('count').eq('slug', slug);
      const {
         data: [userObj],
      } = await supabase
         .from('userSessions')
         .select('*')
         .eq('sessionId', sessionId);

      const userLikes = userObj ? userObj.likes : 0;
      const postLikes = postLikesObj ? postLikesObj.count : 0;

      return Response.json({
         likes: postLikes || 0,
         currentUserLikes: userLikes || 0,
      });
   } catch (err) {
      console.log(err);
   }
};

export const POST = async (req, { params }) => {
   let slug = params.slug;
   try {
      const sessionId = getSessionId(req, params);
      const {
         data: [postLikesObj],
      } = await supabase.from('post_likes').select('count').eq('slug', slug);
      const {
         data: [userObj],
      } = await supabase
         .from('userSessions')
         .select('*')
         .eq('sessionId', sessionId);

      const userLikes = userObj ? userObj.likes : 0;
      const postLikes = postLikesObj ? postLikesObj.count : 0;

      if (!userObj) {
         await supabase
            .from('userSessions')
            .upsert({ sessionId: sessionId, likes: 1 });

         await supabase.rpc('increment_post_likes', { post_slug: slug });

         const {
            data: [updatedLikesObj],
         } = await supabase.from('post_likes').select('count').eq('slug', slug);
         return Response.json({
            currentUserlikes: 1,
            likes: updatedLikesObj ? updatedLikesObj.count : 1,
         });
      } else {
         let currLikes = userObj.likes;
         if (currLikes >= 3)
            return Response.json({
               currentUserLikes: currLikes,
               likes: postLikes,
            });
         await supabase
            .from('userSessions')
            .update({ likes: currLikes + 1 })
            .eq('sessionId', sessionId);

         await supabase.rpc('increment_post_likes', { post_slug: slug });

         return Response.json({
            currentUserLikes: currLikes + 1,
            likes: postLikes + 1,
         });
      }
   } catch (err) {
      console.log(err);
   }
};
