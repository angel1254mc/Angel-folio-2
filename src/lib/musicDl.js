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

export async function musicDlFetch(path, init = {}) {
   const { baseUrl, apiKey } = musicDlConfig();
   return fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
         Authorization: `Bearer ${apiKey}`,
         ...(init.headers || {}),
      },
      cache: 'no-store',
   });
}
