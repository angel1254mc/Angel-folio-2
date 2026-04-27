import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SERVICE_URL = process.env.MUSIC_DL_SERVICE_URL;
const API_KEY = process.env.MUSIC_DL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = 'music-mp3s';

function storageUrl(deezerId) {
   return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${deezerId}.mp3`;
}

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const deezer_id = searchParams.get('deezer_id');
   const title = searchParams.get('title');
   const artist = searchParams.get('artist');

   if (!deezer_id || !title || !artist) {
      return NextResponse.json(
         { error: 'deezer_id, title, and artist params required' },
         { status: 400 }
      );
   }

   // Check if MP3 already exists in Supabase Storage
   const url = storageUrl(deezer_id);
   try {
      const head = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (head.ok) {
         return NextResponse.json({ url });
      }
   } catch {
      // Storage check failed — fall through to microservice
   }

   // Call the microservice to convert
   if (!SERVICE_URL || !API_KEY) {
      return NextResponse.json(
         { error: 'Music download service not configured' },
         { status: 503 }
      );
   }

   try {
      const res = await fetch(`${SERVICE_URL}/convert`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
         },
         body: JSON.stringify({ deezer_id, title, artist }),
         signal: AbortSignal.timeout(100_000),
      });

      const data = await res.json();

      if (!res.ok) {
         return NextResponse.json(
            { error: data.error, message: data.message },
            { status: res.status }
         );
      }

      return NextResponse.json({ url: data.url });
   } catch (err) {
      return NextResponse.json(
         { error: 'service_unavailable', message: err.message },
         { status: 502 }
      );
   }
}
