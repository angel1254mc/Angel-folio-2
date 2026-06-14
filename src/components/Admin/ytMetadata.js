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

// Look up clean metadata via the existing Deezer search proxy.
// Returns the top match or null.
export async function enrichFromDeezer({ title, artist }) {
   const params = new URLSearchParams();
   if (title) params.set('q', title);
   if (artist) params.set('artist', artist);
   const res = await fetch(`/api/admin/music/search?${params}`);
   if (!res.ok) return null;
   const json = await res.json().catch(() => ({}));
   const top = (json.results || [])[0];
   if (!top) return null;
   return {
      title: top.title,
      artist: top.artist,
      album: top.album,
      artwork_url: top.artwork_url,
   };
}
