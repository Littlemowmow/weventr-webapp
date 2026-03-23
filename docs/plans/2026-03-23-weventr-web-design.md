# Weventr Web App — Design Doc

**Date:** 2026-03-23
**Goal:** Ship a web app at weventr.com so users can test the full Weventr experience without iOS/TestFlight.

## Stack

- Next.js 14 (App Router)
- Supabase JS (`@supabase/supabase-js` + `@supabase/ssr`)
- Tailwind CSS (dark theme matching iOS tokens)
- Vercel (deploy + hosting)
- TypeScript

## Shared Backend

Same Supabase project as iOS (`rljbpvpjdofykvoszupl.supabase.co`). Zero backend changes. Same auth, same RLS, same RPC functions, same tables.

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page — hero, mission, waitlist |
| `/login` | Public | Email/password sign in + sign up |
| `/app/discover` | Required | Activity cards with like/pass, city filter |
| `/app/trips` | Required | Trip list, create new trip |
| `/app/trips/[id]` | Required | Trip dashboard (Overview, Schedule, Budget, Logistics tabs) |
| `/app/profile` | Required | Saved activities, stats, settings |
| `/admin` | Admin only | Activity CRUD, user list, trip overview |

## Design Tokens

```
bg: #0E0E0E
card: #1A1A1A
raised: #2A2A2A
teal: #0F4C5C
orange: #FF7A3D
gold: #FFCA2A
text-primary: #FFFFFF
text-secondary: #8E8E93
text-dim: #636366
```

## Features per Page

### Landing Page
- Hero with mission statement
- Feature highlights
- Email waitlist (new `waitlist` table)
- Dark cinematic aesthetic

### Discover
- Activity cards (grid on desktop, stack on mobile)
- Like/pass buttons + keyboard shortcuts
- City filter chips
- Trip context banner (when discovering for a trip)
- Calls same `saved_activities` table + `propose_activity_to_trip` RPC

### Trips
- Trip list with destination, dates, member count
- Create trip form (destination, dates, group size)
- Trip dashboard tabs:
  - **Overview**: proposed activities with vote up/down, invite link, member list
  - **Schedule**: day-by-day itinerary view
  - **Budget**: budget tracking, cost categories, split view
  - **Logistics**: flights, hotels, transport

### Profile
- Saved/liked activities
- Basic stats (trips, countries, XP)
- Sign out

### Admin
- Activity table with search/filter/edit/delete
- Add new activity form
- User list with stats
- Trip overview
- Locked to admin user ID

## Auth
- Email/password (same Supabase auth)
- Accounts shared between iOS and web
- Middleware-based route protection for `/app/*` and `/admin`

## Repo
- GitHub: github.com/Littlemowmow/weventr-webapp
- Local: /Users/hadimuhammadali10/Desktop/Projects/weventr-webapp/
- Deploy: Vercel → weventr.com
