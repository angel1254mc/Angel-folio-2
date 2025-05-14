import { redirect } from 'next/navigation';
import fetch from 'node-fetch';
import querystring from 'querystring';

const TOKEN_URL = `https://accounts.spotify.com/api/token`;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const basicAuth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

export const GET = async (request) => {
   // get query params from request
   const searchParams = request.nextUrl.searchParams;
   const auth_code = searchParams.get('code');
   const queryParams = new URLSearchParams();
   console.log(auth_code);

   const info = await fetch(TOKEN_URL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
         'content-type': 'application/x-www-form-urlencoded',
         Authorization: `Basic ${basicAuth}`,
      },
      body: querystring.stringify({
         code: auth_code,
         redirect_uri: 'http://localhost:3000/api/admin/spotify/callback',
         grant_type: 'authorization_code',
      }),
   });

   console.log(await info.json());

   return redirect('http://localhost:3000');
};
