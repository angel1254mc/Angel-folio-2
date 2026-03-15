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
CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN   # Spotify API
GITHUB_AUTH                                  # GitHub personal access token
NEXT_PUBLIC_SUPABASE_URL                     # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY                    # Supabase service role JWT
NEXT_PUBLIC_SUPABASE_ANON_KEY               # Supabase anon JWT
IP_ADDRESS_SALT                              # Salt for hashing IP addresses (likes system)
NEXT_PUBLIC_FARO_URL                         # Grafana Faro collector URL
LOKI_URL / LOKI_INSTANCE_ID / LOKI_AUTH_TOKEN # Grafana Loki logging
ANGEL_ADMIN_EMAIL                            # Admin login email
LOG_LEVEL                                    # DEBUG | INFO | WARN | ERROR | FATAL
```

## Architecture

Personal portfolio and blog (Next.js App Router). Data lives in **Supabase**. The app has three main surfaces:

- **Public** — home, blog, projects, resume
- **API routes** — third-party integrations (GitHub, Spotify) + a per-post likes system
- **Admin** (`/admin/*`) — authenticated CRUD for posts/projects, protected by middleware

### Data layer

All Supabase query functions are centralized in `src/app/api/index.js`. Pages call these directly as async server components — there is no separate data-fetching abstraction layer. ISR revalidation is set per page (`revalidate = 30` for blog, `15` for projects, `force-dynamic` for admin/home).

### Authentication

`src/middleware.js` guards `/admin/*` and `/api/admin/*` using the Supabase session cookie. Login is restricted to the single email in `ANGEL_ADMIN_EMAIL`. Auth flow uses Supabase Auth with an OAuth callback at `/api/auth/callback`.

### Blog posts

Content is stored as MDX strings in Supabase and rendered with `next-mdx-remote`. Tags use a junction table (`PostTag`). The likes system identifies users by MD5(IP + salt), capped at 3 likes per user per post, via a Supabase RPC call `increment_likes`.

### Projects

Collaborator GitHub avatars are fetched on-demand via `octokit` (client in `src/lib/`). Related blog posts are linked by a `project` field on each post.

### Monitoring

`src/context/` contains two providers initialized in the root layout: `WebVitalsContextProvider` (Core Web Vitals) and `FaroContextProvider` (Grafana Faro frontend observability). Server-side structured logging uses Pino, configured in `src/lib/`.
