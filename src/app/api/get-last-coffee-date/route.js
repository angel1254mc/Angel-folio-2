import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY,
   {
      global: {
         fetch: (url, options = {}) =>
            fetch(url, { ...options, cache: 'no-store' }),
      },
   }
);

export const dynamic = 'force-dynamic';

export const GET = async () => {
   const { data: data } = await supabase.from('Coffee').select('*');

   const lastDrankCoffee = data?.[0];
   if (lastDrankCoffee) {
      return Response.json({
         last_drank: lastDrankCoffee.last_drank,
      });
   }

   return Response.status(500).json({
      message:
         "There was an error: last drank coffee timestamp couldn't be obtained!",
   });
};
