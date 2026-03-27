import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEEZER_TRACK_URL = 'https://api.deezer.com/track';
const FETCH_TIMEOUT = 6000;
const MAX_IDS = 50;

async function fetchPreviewUrl(id) {
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
   try {
      const res = await fetch(`${DEEZER_TRACK_URL}/${id}`, {
         signal: controller.signal,
         next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.preview || null;
   } catch {
      return null;
   } finally {
      clearTimeout(timer);
   }
}

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const idsParam = searchParams.get('ids');

   if (!idsParam) {
      return NextResponse.json(
         { error: 'ids param required' },
         { status: 400 }
      );
   }

   const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_IDS);

   if (ids.length === 0) {
      return NextResponse.json({ previews: {} });
   }

   const results = await Promise.allSettled(
      ids.map(async (id) => ({ id, url: await fetchPreviewUrl(id) }))
   );

   const previews = {};
   for (const result of results) {
      if (result.status === 'fulfilled') {
         previews[result.value.id] = result.value.url;
      }
   }

   return NextResponse.json({ previews });
}
