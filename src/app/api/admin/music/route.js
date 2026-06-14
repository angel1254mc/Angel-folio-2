import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { musicDlFetch } from '@/lib/musicDl';

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

   // Round-trip validate: ensure year/month are real calendar values
   if (!year || !mon || mon < 1 || mon > 12) {
      return NextResponse.json(
         { error: 'Invalid month value' },
         { status: 400 }
      );
   }

   const start = `${month}-01`;
   const endDate = new Date(year, mon, 0); // last day of month
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

export async function POST(request) {
   const body = await request.json();
   const {
      date,
      title,
      artist,
      album,
      artwork_url,
      track_url,
      preview_url,
      id,
      source,
      snippet_url,
      youtube_id,
      snippet_start_sec,
   } = body;

   if (!date || !title || !artist) {
      return NextResponse.json(
         { error: 'date, title, and artist are required' },
         { status: 400 }
      );
   }

   if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
         { error: 'date must be YYYY-MM-DD' },
         { status: 400 }
      );
   }

   // Round-trip validate: ensure the date is a real calendar date
   const [y, m, d] = date.split('-').map(Number);
   const probe = new Date(y, m - 1, d);
   if (
      probe.getFullYear() !== y ||
      probe.getMonth() !== m - 1 ||
      probe.getDate() !== d
   ) {
      return NextResponse.json(
         { error: 'Invalid calendar date' },
         { status: 400 }
      );
   }

   const { data, error } = await supabase
      .from('song_of_the_day')
      .upsert(
         {
            date,
            title,
            artist,
            album,
            artwork_url,
            track_url,
            preview_url,
            deezer_id: id || null,
            source: source || 'deezer',
            snippet_url: snippet_url || null,
            youtube_id: youtube_id || null,
            snippet_start_sec:
               typeof snippet_start_sec === 'number' ? snippet_start_sec : null,
         },
         { onConflict: 'date' }
      )
      .select()
      .single();

   if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json({ song: data });
}

export async function DELETE(request) {
   const { searchParams } = new URL(request.url);
   const date = searchParams.get('date');

   if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
         { error: 'date must be YYYY-MM-DD' },
         { status: 400 }
      );
   }

   // Round-trip validate: ensure the date is a real calendar date
   const [y, m, d] = date.split('-').map(Number);
   const probe = new Date(y, m - 1, d);
   if (
      probe.getFullYear() !== y ||
      probe.getMonth() !== m - 1 ||
      probe.getDate() !== d
   ) {
      return NextResponse.json(
         { error: 'Invalid calendar date' },
         { status: 400 }
      );
   }

   // Look up the row so we know whether a snippet cascade is needed.
   const { data: existing, error: fetchErr } = await supabase
      .from('song_of_the_day')
      .select('source, snippet_url')
      .eq('date', date)
      .maybeSingle();

   if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
   }

   // Nothing to clear — idempotent success.
   if (!existing) {
      return NextResponse.json({ ok: true });
   }

   // Best-effort snippet cascade for YouTube days.
   let warning;
   if (existing.source === 'youtube' && existing.snippet_url) {
      try {
         const res = await musicDlFetch('/yt/snippet', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ snippet_url: existing.snippet_url }),
         });
         if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            warning = `Snippet not deleted: ${j.error || res.status}`;
         }
      } catch (err) {
         warning = `Snippet not deleted: ${err.message}`;
      }
   }

   const { error: delErr } = await supabase
      .from('song_of_the_day')
      .delete()
      .eq('date', date);

   if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
   }

   return NextResponse.json(warning ? { ok: true, warning } : { ok: true });
}
