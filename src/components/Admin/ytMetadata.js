// Best-effort parse of a YouTube video title into { title, artist }.
export function parseYouTubeTitle(rawTitle, channel = '') {
   let t = (rawTitle || '').trim();

   // Drop bracketed/parenthesized noise like (Official Video), [4K], (Lyrics)
   t = t
      .replace(
         /[\(\[][^)\]]*(official|video|audio|lyric|lyrics|hd|4k|mv|m\/v|visualizer|remaster(ed)?)[^)\]]*[\)\]]/gi,
         ''
      )
      .trim();
   // Drop trailing "- Official ...", "| Lyrics", etc.
   t = t.replace(/\s*[-–—|]\s*(official.*|lyric.*|audio.*)$/i, '').trim();

   // "Artist - Title" pattern
   const dash = t.split(/\s+[-–—]\s+/);
   if (dash.length >= 2) {
      return { artist: dash[0].trim(), title: dash.slice(1).join(' - ').trim() };
   }

   // Fallback: channel as artist (strip a trailing "- Topic")
   const artist = (channel || '').replace(/\s*-\s*topic$/i, '').trim();
   return { artist, title: t };
}

// Free-form Deezer search for the enrichment picker. Returns the results list
// ([{ id, title, artist, album, artwork_url, ... }]) so the user can pick a match.
export async function searchDeezer(query) {
   const q = (query || '').trim();
   if (!q) return [];
   const params = new URLSearchParams({ q, scope: 'all' });
   const res = await fetch(`/api/admin/music/search?${params}`);
   if (!res.ok) return [];
   const json = await res.json().catch(() => ({}));
   return json.results || [];
}
