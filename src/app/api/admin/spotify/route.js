import { redirect } from 'next/navigation';

const scopes = ['user-read-recently-played', 'user-read-currently-playing'];

export const GET = async () => {
   const scope = scopes.join(' ');
   const queryParams = new URLSearchParams();
   queryParams.set('response_type', 'code');
   queryParams.set('client_id', process.env.CLIENT_ID);
   queryParams.set('scope', scope);
   queryParams.set(
      'redirect_uri',
      'http://localhost:3000/api/admin/spotify/callback'
   );
   queryParams.set('show_dialog', true);

   return redirect(
      'https://accounts.spotify.com/authorize?' + queryParams.toString()
   );
};
