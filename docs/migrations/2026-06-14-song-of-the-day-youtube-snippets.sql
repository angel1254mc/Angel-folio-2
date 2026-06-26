-- Add YouTube-snippet support to song_of_the_day (additive, backward-compatible).
alter table public.song_of_the_day
  add column if not exists source            text not null default 'deezer',
  add column if not exists snippet_url        text,
  add column if not exists youtube_id         text,
  add column if not exists snippet_start_sec  numeric;
