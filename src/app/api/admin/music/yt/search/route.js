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
      res = await musicDlFetch(
         `/yt/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`
      );
   } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
   }

   const json = await res.json().catch(() => ({}));
   if (!res.ok) {
      return NextResponse.json(
         { error: json.error || 'YouTube search failed' },
         { status: res.status }
      );
   }
   return NextResponse.json({ results: json.results || [] });
}
