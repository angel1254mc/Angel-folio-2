import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export const GET = async () => {
   // Supabase client is intentionally initialized per-request here (not at module level).
   // This endpoint is the public-facing widget that must always reflect the latest saved song.
   // A module-level client could hold a stale fetch reference due to Next.js module caching,
   // causing the cache: 'no-store' override to not take effect on subsequent calls.
   // All other routes either use force-dynamic with a service-role client (admin) or
   // have acceptable staleness, so only this endpoint needs the per-request pattern.
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

   const { data, error } = await supabase
      .from('song_of_the_day')
      .select('date,title,artist,album,artwork_url,track_url')
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
