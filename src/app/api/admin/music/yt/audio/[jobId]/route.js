import { musicDlFetch } from '@/lib/musicDl';

export const dynamic = 'force-dynamic';

// Streams the song audio from the music-dl-service to the (already admin-authed)
// browser. Passes Range through both ways so <audio> scrubbing + Web Audio decoding work.
export async function GET(request, { params }) {
   const { jobId } = params;
   const range = request.headers.get('range');

   let res;
   try {
      res = await musicDlFetch(`/yt/audio/${encodeURIComponent(jobId)}`, {
         headers: range ? { Range: range } : {},
      });
   } catch (err) {
      return new Response(err.message, { status: 500 });
   }

   const headers = new Headers();
   [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
   ].forEach((h) => {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
   });
   if (!headers.has('cache-control')) headers.set('cache-control', 'no-store');

   return new Response(res.body, { status: res.status, headers });
}
