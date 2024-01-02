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
   try {
      const sessionId = getSessionId(req, params);
      // In both GET and POST method  situation, we havee to grab the likes on the post as well as the likes already
      // added by the user
      // Both technically return an object with a "likes" field, so account for this by retrieving the integer
      // value stored in that field.
      const {
         data: [postLikesObj],
      } = await supabase.from('posts').select('likes').eq('slug', slug);
      const {
         data: [userObj],
      } = await supabase
         .from('userSessions')
         .select('*')
         .eq('sessionId', sessionId);

      const userLikes = userObj ? userObj.likes : 0;
      const postLikes = postLikesObj.likes;

      return Response.json({
         likes: postLikes || 0,
         currentUserLikes: userLikes || 0,
      });
   } catch (err) {
      console.log(err);
   }
};

export const POST = async (req, { params }) => {
   try {
      const sessionId = getSessionId(req, params);
      // In both GET and POST method  situation, we havee to grab the likes on the post as well as the likes already
      // added by the user
      // Both technically return an object with a "likes" field, so account for this by retrieving the integer
      // value stored in that field.
      const {
         data: [postLikesObj],
      } = await supabase.from('posts').select('likes').eq('slug', slug);
      const {
         data: [userObj],
      } = await supabase
         .from('userSessions')
         .select('*')
         .eq('sessionId', sessionId);

      const userLikes = userObj ? userObj.likes : 0;
      const postLikes = postLikesObj.likes;

      if (!userObj) {
         await supabase
            .from('userSessions')
            .upsert({ sessionId: sessionId, likes: 1 });

         const {
            data: [post],
         } = await supabase.from('posts').select('id').eq('slug', slug);
         const response = await supabase.rpc('increment_likes', {
            pid: post.id,
         });
         const {
            data: [postLikeObj],
         } = await supabase.from('posts').select('likes').eq('slug', slug);
         return Response.json({
            currentUserlikes: 1,
            likes: postLikeObj.likes,
         });
      } else {
         let currLikes = userObj.likes;
         if (currLikes >= 3)
            return Response.json({
               currentUserLikes: currLikes,
               likes: postLikesObj.likes,
            });
         const update = await supabase
            .from('userSessions')
            .update({ likes: currLikes + 1 })
            .eq('sessionId', sessionId);
         const {
            data: [post],
         } = await supabase.from('posts').select('id').eq('slug', slug);

         const response = await supabase.rpc('increment_likes', {
            pid: post.id,
         });
         console.log(response);

         return Response.json({
            currentUserLikes: currLikes + 1,
            likes: postLikesObj.likes + 1,
         });
      }
   } catch (err) {
      console.log(err);
   }
};
