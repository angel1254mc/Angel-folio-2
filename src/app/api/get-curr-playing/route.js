import fetch from 'node-fetch';
import querystring from 'querystring';

// Store grab clientID, clientSecret, refreshToken from environment
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

// Grab that access token
const TOKEN_URL = `https://accounts.spotify.com/api/token`;
const basicAuth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
const NOW_PLAYING_URL =
   'https://api.spotify.com/v1/me/player/currently-playing';

export const dynamic = 'force-dynamic'

export const GET = async () => {
   const { access_token } = await getAccessToken();
   console.log('Received Access Token: ' + access_token);

   const info = await fetch(NOW_PLAYING_URL, {
      next: {
         revalidate: 0
      },
      cache: 'no-store',
      headers: {
         Authorization: `Bearer ${access_token}`,
      },
   });
   if (info.status == 204)
      return Response.json(
         { message: 'Nothing currently playing!' },
         { status: 200 }
      );
   const json = await info.json();
   return Response.json(json);
};

// Gets the access token required for the api call in the handler function

const getAccessToken = async () => {
   const response = await fetch(TOKEN_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
         Authorization: `Basic ${basicAuth}`,
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
      }),
   });
   return response.json();
};
