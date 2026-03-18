import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const q = searchParams.get('q');
   const artist = searchParams.get('artist');
   const mode = searchParams.get('mode'); // 'artists' | undefined

   // Artist autocomplete mode — returns a list of artist name strings
   if (mode === 'artists') {
      if (!q) return NextResponse.json({ artists: [] });
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=musicArtist&attribute=artistTerm&limit=8`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok)
         return NextResponse.json(
            { error: 'iTunes search failed' },
            { status: 502 }
         );
      const json = await response.json();
      const artists = [
         ...new Set(
            (json.results || []).map((r) => r.artistName).filter(Boolean)
         ),
      ];
      return NextResponse.json({ artists });
   }

   if (!q && !artist) {
      return NextResponse.json({ results: [] });
   }

   // Combine artist + song term; fall back to whichever is provided
   const offset = parseInt(searchParams.get('offset') || '0', 10);
   const term = [artist, q].filter(Boolean).join(' ');
   const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&attribute=songTerm&limit=12&offset=${offset}`;
   const response = await fetch(url, { cache: 'no-store' });

   if (!response.ok) {
      return NextResponse.json(
         { error: 'iTunes search failed' },
         { status: 502 }
      );
   }

   const json = await response.json();

   const results = (json.results || []).map((item) => ({
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName,
      artwork_url: (item.artworkUrl100 || '').replace('100x100bb', '400x400bb'),
      track_url: item.trackViewUrl,
   }));

   return NextResponse.json({ results });
}
