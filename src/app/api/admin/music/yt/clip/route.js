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
   const { jobId, startSec } = body;

   if (!jobId || typeof startSec !== 'number') {
      return NextResponse.json(
         { error: 'jobId and numeric startSec are required' },
         { status: 400 }
      );
   }

   let res;
   try {
      res = await musicDlFetch('/yt/clip', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ jobId, startSec }),
      });
   } catch (err) {
      console.error(
         '[yt/clip] upstream fetch threw:',
         err?.message,
         err?.cause?.code || err?.cause || ''
      );
      return NextResponse.json(
         { error: 'Failed to create snippet' },
         { status: 500 }
      );
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      console.error('[yt/clip] upstream non-OK', res.status, json);
      // 410 = the in-RAM job expired; surface it so the client can prompt a
      // re-pick. Any other non-OK is a server-side failure → 500.
      const status = res.status === 410 ? 410 : 500;
      return NextResponse.json(
         { error: json.error || 'Failed to create snippet' },
         { status }
      );
   }
   return NextResponse.json(json);
}
