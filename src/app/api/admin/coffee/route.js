import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
   const { error } = await supabase
      .from('Coffee')
      .update({ last_drank: new Date().toISOString() })
      .eq('id', 1);

   if (error) {
      return NextResponse.json(
         { error: "Error updating the 'coffee' table", rawError: error },
         { status: 500 }
      );
   }

   return NextResponse.json({ message: 'Coffee counter reset successfully' });
}
