import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler (req, res) {
    try {

        const ipAddy = req.headers['x-forwarded-for'] ?? "0.0.0.0";
        const slug = req.query.slug;

        const currentUserId = createHash("md5")
        .update(ipAddy + process.env.IP_ADDRESS_SALT, "utf8")
        .digest("hex")

        const sessionId = slug + "___" + currentUserId;

        // use IP Address from header, encrypt, and salt so even I don't know what the original address is
        switch (req.method) {
            case "GET": {
                // For get methods, get the number of likes in the post as well as the amount of likes the user has on the post
                const {data: [postLikesObj] } = await supabase.from('posts').select('likes').eq('slug', slug);
                const {data:  [userLikesObj]  } = await supabase.from('userSessions').select('likes').eq('sessionId', sessionId);
                const userLikes = userLikesObj ? userLikesObj.likes : 0;
                const postLikes = postLikesObj.likes;
                res.json({
                    likes: postLikes || 0,
                    currentUserLikes: userLikes || 0,
                })
                
                break;
            }
            case "POST": {
                // If user exists in db, increment likes in their row.
                // If user doesn't exist, make a new row for that user and increment their likes!

                const {data: [userSession]} = await supabase.from('userSessions').select('*').eq('sessionId', sessionId);
                // Check if user session already exists
                if (!userSession) {
                    await supabase.from('userSessions').upsert({sessionId: sessionId, likes: 1});

                    const {data: [post]} = await supabase.from('posts').select('id').eq('slug', slug);
                    const response = await supabase.rpc('increment_likes', {
                        pid: post.id,
                    });
                    const {data: [postLikeObj]} = await supabase.from('posts').select('likes').eq('slug', slug);
                    res.json({
                        currentUserlikes: 1,
                        likes: postLikeObj.likes
                    })
                } else {
                    let currLikes = userSession.likes;
                    const {data: [postLikeObj]} = await supabase.from('posts').select('likes').eq('slug', slug);
                    if (currLikes >= 3)
                        return res.json({
                            currentUserLikes: currLikes,
                            likes: postLikeObj.likes
                        })
                    const update = await supabase.from('userSessions').update({likes: (currLikes + 1)}).eq('sessionId', sessionId);
                    const {data: [post]} = await supabase.from('posts').select('id').eq('slug', slug);

                    const response = await supabase.rpc('increment_likes', {
                       pid: post.id,
                    });
                    console.log(response);

                    res.json({
                        currentUserLikes: currLikes + 1,
                        likes: postLikeObj.likes + 1
                    })
                }
                break;
            }
        }
    } catch (err) {
        console.log(err);
    }
} 