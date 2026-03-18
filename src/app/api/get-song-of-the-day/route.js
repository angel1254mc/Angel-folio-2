import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
   {
      global: {
         fetch: (url, options = {}) =>
            fetch(url, { ...options, cache: 'no-store' }),
      },
   }
);

export const dynamic = 'force-dynamic';

export const GET = async () => {
   const { data, error } = await supabase
      .from('song_of_the_day')
      .select('*')
      .order('date', { ascending: false })
      .limit(1);

   if (error) {
      return Response.json({ error: error.message }, { status: 500 });
   }

   const song = data?.[0];
   if (!song) {
      return Response.json({ song: null });
   }

   return Response.json({
      date: song.date,
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork_url: song.artwork_url,
      track_url: song.track_url,
   });
};
