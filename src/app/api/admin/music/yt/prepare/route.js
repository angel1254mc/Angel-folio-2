import { NextResponse } from 'next/server';
import { musicDlFetch } from '@/lib/musicDl';

export const dynamic = 'force-dynamic';

export async function POST(request) {
   let body;
   try {
      body = await request.json();
   } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }
   const { videoId } = body;

   if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
   }

   let res;
   try {
      res = await musicDlFetch('/yt/prepare', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ videoId }),
      });
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      return NextResponse.json(
         { error: json.error || 'Failed to prepare audio' },
         { status: res.status }
      );
   }
   return NextResponse.json(json);
}
