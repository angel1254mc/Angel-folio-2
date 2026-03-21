/**
 * Runbook: Backfill preview_url for existing song_of_the_day rows
 *
 * Prerequisites:
 *   Run this SQL in the Supabase SQL Editor first:
 *     ALTER TABLE song_of_the_day ADD COLUMN preview_url text;
 *
 * This script:
 *   1. Verifies the `preview_url` column exists (exits with instructions if not)
 *   2. Fetches all rows that don't have a `preview_url` yet
 *   3. Searches Deezer by title + artist for each, and writes the preview URL back
 *
 * Environment variables (reads .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/backfill-preview-urls.mjs              # backfill all rows missing preview_url
 *   node scripts/backfill-preview-urls.mjs --dry-run    # preview what would be updated without writing
 */

import { createClient } from '@supabase/supabase-js';

// ── Load .env.local if present ──────────────────────────────────────────────
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
   const envPath = resolve(process.cwd(), '.env.local');
   const envFile = readFileSync(envPath, 'utf-8');
   for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
   }
} catch {
   // no .env.local, rely on env vars being set
}

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEZER_SEARCH_URL = 'https://api.deezer.com/search';
const DEEZER_DELAY_MS = 300; // rate-limit courtesy delay between requests
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_KEY) {
   console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
   );
   process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchDeezerPreview(title, artist) {
   const term = `artist:"${artist}" track:"${title}"`;
   const url = `${DEEZER_SEARCH_URL}?q=${encodeURIComponent(term)}&limit=5`;

   const res = await fetch(url);
   if (!res.ok) return null;

   const json = await res.json();
   const tracks = json.data || [];
   if (tracks.length === 0) return null;

   // Prefer exact title match (case-insensitive), otherwise take first result
   const titleLower = title.toLowerCase();
   const exact = tracks.find((t) => t.title?.toLowerCase() === titleLower);
   const best = exact || tracks[0];

   return best.preview || null;
}

// ── Schema check ────────────────────────────────────────────────────────────
async function ensurePreviewUrlColumn() {
   const { error } = await supabase
      .from('song_of_the_day')
      .select('preview_url')
      .limit(1);

   if (error && error.message.includes('preview_url')) {
      console.error(
         'The preview_url column does not exist yet.\n' +
         'Run this SQL in the Supabase SQL Editor first:\n\n' +
         '  ALTER TABLE song_of_the_day ADD COLUMN preview_url text;\n'
      );
      process.exit(1);
   }

   console.log('Schema OK: preview_url column exists.\n');
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
   console.log(DRY_RUN ? '=== DRY RUN ===' : '=== Backfilling preview URLs ===');

   await ensurePreviewUrlColumn();

   // Fetch all rows that don't have a preview_url yet
   const { data: songs, error } = await supabase
      .from('song_of_the_day')
      .select('date, title, artist, preview_url')
      .is('preview_url', null)
      .order('date', { ascending: true });

   if (error) {
      console.error('Failed to fetch songs:', error.message);
      process.exit(1);
   }

   console.log(`Found ${songs.length} songs missing preview_url\n`);

   let updated = 0;
   let skipped = 0;
   let failed = 0;

   for (const song of songs) {
      const label = `${song.date} | ${song.artist} - ${song.title}`;

      let previewUrl;
      try {
         previewUrl = await searchDeezerPreview(song.title, song.artist);
      } catch (err) {
         console.log(`  FAIL  ${label} (${err.message})`);
         failed++;
         await sleep(DEEZER_DELAY_MS);
         continue;
      }

      if (!previewUrl) {
         console.log(`  SKIP  ${label} (no preview found on Deezer)`);
         skipped++;
         await sleep(DEEZER_DELAY_MS);
         continue;
      }

      if (DRY_RUN) {
         console.log(`  WOULD UPDATE  ${label}`);
         updated++;
      } else {
         const { error: updateErr } = await supabase
            .from('song_of_the_day')
            .update({ preview_url: previewUrl })
            .eq('date', song.date);

         if (updateErr) {
            console.log(`  FAIL  ${label} (${updateErr.message})`);
            failed++;
         } else {
            console.log(`  OK    ${label}`);
            updated++;
         }
      }

      await sleep(DEEZER_DELAY_MS);
   }

   console.log(
      `\nDone. ${updated} updated, ${skipped} skipped, ${failed} failed.`
   );
}

main();
