import { NextResponse } from 'next/server';
import { musicDlFetch } from '@/lib/musicDl';

export const dynamic = 'force-dynamic';

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const q = searchParams.get('q');
   const limit = searchParams.get('limit') || '10';

   if (!q || !q.trim()) {
      return NextResponse.json({ results: [] });
   }

   let res;
   try {
      res = await musicDlFetch('/yt/search', { params: { q, limit } });
   } catch (err) {
      console.error(
         '[yt/search] upstream fetch threw:',
         err?.message,
         err?.cause?.code || err?.cause || ''
      );
      return NextResponse.json(
         { error: 'YouTube search failed' },
         { status: 500 }
      );
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      // A non-OK from our own service is a server-side failure — surface 500,
      // don't pass the upstream status (e.g. a 400) through to the client.
      console.error('[yt/search] upstream non-OK', res.status, json);
      return NextResponse.json(
         { error: 'YouTube search failed' },
         { status: 500 }
      );
   }
   return NextResponse.json({ results: json.results || [] });
}
