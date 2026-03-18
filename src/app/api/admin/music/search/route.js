import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';
const DEEZER_ARTIST_URL = 'https://api.deezer.com/search/artist';
const DEEZER_TIMEOUT_MS = 6000;

async function fetchDeezer(url, options = {}) {
   const controller = new AbortController();
   const timer = setTimeout(() => controller.abort(), DEEZER_TIMEOUT_MS);
   try {
      return await fetch(url, { ...options, signal: controller.signal });
   } finally {
      clearTimeout(timer);
   }
}

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const q = searchParams.get('q');
   const artist = searchParams.get('artist');
   const mode = searchParams.get('mode'); // 'artists' | undefined

   // Artist autocomplete mode — returns a list of artist name strings
   if (mode === 'artists') {
      if (!q) return NextResponse.json({ artists: [] });
      const url = `${DEEZER_ARTIST_URL}?q=${encodeURIComponent(q)}&limit=8`;
      let response;
      try {
         response = await fetchDeezer(url, { next: { revalidate: 300 } });
      } catch {
         return NextResponse.json({ error: 'Deezer unavailable' }, { status: 502 });
      }
      if (!response.ok)
         return NextResponse.json({ error: 'Deezer search failed' }, { status: 502 });
      const json = await response.json();
      const artists = [
         ...new Set((json.data || []).map((r) => r.name).filter(Boolean)),
      ];
      return NextResponse.json({ artists });
   }

   if (!q && !artist) {
      return NextResponse.json({ results: [] });
   }

   // Build scoped query
   const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);
   let term;
   if (q && artist) {
      term = `artist:"${artist}" track:"${q}"`;
   } else if (q) {
      term = `track:"${q}"`;
   } else {
      term = `artist:"${artist}"`;
   }

   const url = `${DEEZER_SEARCH_URL}?q=${encodeURIComponent(term)}&limit=12&index=${offset}`;
   let response;
   try {
      response = await fetchDeezer(url, { next: { revalidate: 300 } });
   } catch {
      return NextResponse.json({ error: 'Deezer unavailable' }, { status: 502 });
   }

   if (!response.ok) {
      return NextResponse.json({ error: 'Deezer search failed' }, { status: 502 });
   }

   const json = await response.json();
   const results = (json.data || []).map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.artist?.name,
      album: item.album?.title,
      artwork_url: item.album?.cover_big || item.album?.cover_medium,
      track_url: item.link,
   }));

   return NextResponse.json({ results, total: json.total ?? 0 });
}
