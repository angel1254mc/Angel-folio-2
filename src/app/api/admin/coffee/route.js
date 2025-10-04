import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
   try {
      let error = (
         await supabase
            .from('Coffee')
            .update({
               id: 1,
               last_drank: new Date().toISOString().toLocaleString(),
            })
            .eq('id', 1)
      ).error;

      if (error) {
         return NextResponse.json(
            {
               timestamp: Date.now(),
               status: 500,
               error: "Error updating the 'coffee' table",
               rawError: error,
               path: '/api/admin/coffee',
            },
            { status: 500 }
         );
      }

      return NextResponse.json(
         {
            message: 'Coffee counter reset successfully',
         },
         {
            status: 200,
         }
      );
   } catch (err) {
      return NextResponse.json(
         {
            timestamp: Date.now(),
            status: 500,
            error: 'Error resetting coffee counter',
            rawError: err,
            path: '/api/admin/coffee',
         },
         { status: 500 }
      );
   }
}
