// Authenticated fetch wrapper to the music-dl-service.
// Env is read per-call so route handlers fail clearly if it's unset.
function musicDlConfig() {
   const baseUrl = process.env.MUSIC_DL_SERVICE_URL;
   const apiKey = process.env.MUSIC_DL_API_KEY;
   if (!baseUrl || !apiKey) {
      throw new Error(
         'MUSIC_DL_SERVICE_URL and MUSIC_DL_API_KEY env vars are required'
      );
   }
   return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
}

// `init.params` (a plain object) is serialized + URL-encoded onto the query
// string here, so callers never hand-concatenate/encode query params.
export async function musicDlFetch(path, init = {}) {
   const { baseUrl, apiKey } = musicDlConfig();
   const { params, headers, ...rest } = init;

   let url = `${baseUrl}${path}`;
   if (params && typeof params === 'object') {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
         if (value !== undefined && value !== null) qs.set(key, String(value));
      }
      const query = qs.toString();
      if (query) url += (url.includes('?') ? '&' : '?') + query;
   }

   return fetch(url, {
      ...rest,
      headers: {
         Authorization: `Bearer ${apiKey}`,
         ...(headers || {}),
      },
      cache: 'no-store',
   });
}
