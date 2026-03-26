import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL,
   process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const dynamic = 'force-dynamic';

export async function GET(request) {
   const { searchParams } = new URL(request.url);
   const month = searchParams.get('month'); // YYYY-MM

   if (!month) {
      return NextResponse.json(
         { error: 'month param required' },
         { status: 400 }
      );
   }

   const [year, mon] = month.split('-').map(Number);

   if (!year || !mon || mon < 1 || mon > 12) {
      return NextResponse.json(
         { error: 'Invalid month value' },
         { status: 400 }
      );
   }

   const start = `${month}-01`;
   const endDate = new Date(year, mon, 0);
   const end = `${month}-${String(endDate.getDate()).padStart(2, '0')}`;

   const { data, error } = await supabase
      .from('song_of_the_day')
      .select('*')
      .gte('date', start)
      .lte('date', end);

   if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json({ songs: data });
}
