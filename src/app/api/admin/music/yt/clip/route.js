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
      return NextResponse.json({ error: err.message }, { status: 500 });
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      return NextResponse.json(
         { error: json.error || 'Failed to create snippet' },
         { status: res.status }
      );
   }
   return NextResponse.json(json);
}
