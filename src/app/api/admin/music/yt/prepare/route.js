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
      console.error(
         '[yt/prepare] upstream fetch threw:',
         err?.message,
         err?.cause?.code || err?.cause || ''
      );
      return NextResponse.json(
         { error: 'Failed to prepare audio' },
         { status: 500 }
      );
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      // Non-OK from our own service → surface 500, not the upstream status.
      console.error('[yt/prepare] upstream non-OK', res.status, json);
      return NextResponse.json(
         { error: 'Failed to prepare audio' },
         { status: 500 }
      );
   }
   return NextResponse.json(json);
}
