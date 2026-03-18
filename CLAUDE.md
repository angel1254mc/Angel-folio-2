# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # Run ESLint
npm run format    # Check Prettier formatting
npm run format:fix # Auto-fix Prettier formatting
```

No test suite is configured.

## Required Environment Variables

```
GITHUB_AUTH                                  # GitHub personal access token
NEXT_PUBLIC_SUPABASE_URL                     # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY                    # Supabase service role JWT (used by all API routes)
NEXT_PUBLIC_SUPABASE_ANON_KEY               # Supabase anon JWT (frontend only)
IP_ADDRESS_SALT                              # Salt for hashing IP addresses (likes system)
NEXT_PUBLIC_FARO_URL                         # Grafana Faro collector URL
LOKI_URL / LOKI_INSTANCE_ID / LOKI_AUTH_TOKEN # Grafana Loki logging
ANGEL_ADMIN_EMAIL                            # Admin login email
LOG_LEVEL                                    # DEBUG | INFO | WARN | ERROR | FATAL
```

## Architecture

Personal portfolio and blog (Next.js App Router). The app has three main surfaces:

- **Public** — home, blog, projects, resume
- **API routes** — third-party integrations (GitHub, Deezer search) + a per-post likes system
- **Admin** (`/admin`) — coffee timer, song-of-the-day calendar, and logout, protected by middleware

### Data layer

All content read functions are centralized in `src/app/api/index.js`. Pages call these directly as async server components — there is no separate data-fetching abstraction layer. ISR revalidation is set per page (`revalidate = 30` for blog, `15` for projects, `force-dynamic` for admin/home).

**Blog posts** live in `src/content/posts/[slug].mdx`. The filename is the slug. Each file has YAML frontmatter (title, excerpt, emoji, imageURI, tags, project, date) followed by MDX content. Parsed at build/request time with `gray-matter` + `next-mdx-remote`.

**Projects** live in `src/content/projects/[slug].json`. The filename is the slug. Fields: name, slug, date, desc, summary, tools, github, authors, lessons, accomplishments, added. Ordered by `added` (descending) in `getAllProjectsSupa`.

To add a post or project: create the file and open a PR. There is no admin UI for authoring.

**Supabase** is still used for:
- `post_likes` — total like count per slug, incremented via `increment_post_likes(post_slug)` RPC
- `userSessions` — per-IP like tracking (MD5(IP + salt), capped at 3 likes per user per post)
- `Coffee` — timestamp of last coffee, reset via `/api/admin/coffee`
- `song_of_the_day` — one row per date (`date`, `title`, `artist`, `album`, `artwork_url`, `track_url`); upserted on conflict by date
- Supabase Auth — protects `/admin/*` and `/api/admin/*`

### Authentication

`src/middleware.js` guards `/admin/*` and `/api/admin/*` using the Supabase session cookie. Login is restricted to the single email in `ANGEL_ADMIN_EMAIL`. Auth flow uses Supabase Auth with an OAuth callback at `/api/auth/callback`.

### Blog posts

MDX files in `src/content/posts/` are read with `fs` + `gray-matter`. Tags are stored as an array in frontmatter. The likes system identifies users by MD5(IP + salt), capped at 3 likes per user per post, via the `increment_post_likes` Supabase RPC on the `post_likes` table.

### Projects

JSON files in `src/content/projects/` are read with `fs` + `JSON.parse`. Collaborator GitHub avatars are fetched on-demand via `octokit` (client in `src/lib/`). Related blog posts are linked by a `project` field in each post's frontmatter matching the project's slug.

### Admin

`/admin` shows a coffee widget (live elapsed time since last coffee + a reset button) and a logout button. There is no post/project CRUD UI — authoring is file-based.

`/admin/music` shows the song-of-the-day calendar. Each day cell is clickable and opens `MusicSearchModal`, which proxies search queries to Deezer (`/api/admin/music/search`) and POSTs the picked song to `/api/admin/music`. The public homepage widget reads the latest entry via `/api/get-song-of-the-day`.

### Monitoring

`src/context/` contains two providers initialized in the root layout: `WebVitalsContextProvider` (Core Web Vitals) and `FaroContextProvider` (Grafana Faro frontend observability). Server-side structured logging uses Pino, configured in `src/lib/`.
