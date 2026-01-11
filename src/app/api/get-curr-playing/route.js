import querystring from 'querystring';
import { createLogger, getRequestMetadata } from '../../../lib/logger.js';

// Store grab clientID, clientSecret, refreshToken from environment
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

// Grab that access token
const TOKEN_URL = `https://accounts.spotify.com/api/token`;
const basicAuth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/recently-played';

export const dynamic = 'force-dynamic';

export const GET = async (request) => {
   // Create logger with request context
   const logger = createLogger({
      route: 'get-curr-playing',
      ...getRequestMetadata(request)
   });
   
   logger.info('Starting Spotify currently playing request');
   
   try {
      logger.debug('Attempting to get Spotify access token');
      const { access_token } = await getAccessToken(logger);
      
      if (!access_token) {
         logger.error('Failed to obtain Spotify access token');
         return Response.json(
            { message: 'Failed to authenticate with Spotify' },
            { status: 500 }
         );
      }
      
      logger.debug('Successfully obtained access token, fetching recently played tracks');
      
      const info = await fetch(NOW_PLAYING_URL, {
         next: {
            revalidate: 0,
         },
         cache: 'no-store',
         headers: {
            Authorization: `Bearer ${access_token}`,
         },
      });
      
      logger.debug('Spotify API response received', { 
         status: info.status,
         statusText: info.statusText,
         headers: {
            contentType: info.headers.get('content-type'),
            rateLimitRemaining: info.headers.get('x-ratelimit-remaining'),
            rateLimitReset: info.headers.get('x-ratelimit-reset')
         }
      });

      if (info.status == 204) {
         logger.info('No tracks currently playing (204 response)');
         return Response.json(
            { message: 'Nothing currently playing!' },
            { status: 200 }
         );
      }

      if (!info.ok) {
         logger.error('Spotify API request failed', {
            status: info.status,
            statusText: info.statusText
         });
         return Response.json(
            { message: 'Failed to fetch currently playing track' },
            { status: 500 }
         );
      }

      const json = await info.json();
      
      if (!json.items || json.items.length === 0) {
         logger.info('No recent tracks found in Spotify response');
         return Response.json(
            { message: 'Nothing currently playing!' },
            { status: 200 }
         );
      }
      
      const track = json.items[0].track;
      logger.info('Successfully retrieved current track', {
         trackName: track?.name,
         artist: track?.artists?.[0]?.name,
         album: track?.album?.name,
         trackId: track?.id
      });

      return Response.json({ item: track }, { status: 200 });
   } catch (err) {
      logger.error('Unexpected error in get-curr-playing route', {
         error: err.message,
         stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
      });
      
      return Response.json(
         { message: 'Nothing currently playing!' },
         { status: 500 }
      );
   }
};

// Gets the access token required for the api call in the handler function
const getAccessToken = async (logger) => {
   const childLogger = logger.child({ function: 'getAccessToken' });
   
   try {
      childLogger.debug('Requesting new Spotify access token using refresh token');
      
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
      
      if (!response.ok) {
         childLogger.error('Failed to refresh Spotify access token', {
            status: response.status,
            statusText: response.statusText
         });
         throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }
      
      const tokenData = await response.json();
      
      if (tokenData.error) {
         childLogger.error('Spotify returned error in token response', {
            error: tokenData.error,
            errorDescription: tokenData.error_description
         });
         throw new Error(`Spotify token error: ${tokenData.error}`);
      }
      
      childLogger.debug('Successfully refreshed Spotify access token');
      return tokenData;
      
   } catch (error) {
      childLogger.error('Exception during token refresh', {
         error: error.message
      });
      throw error;
   }
};
